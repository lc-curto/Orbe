<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CardInvoice;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use Illuminate\Support\Facades\DB;

final class FinancialRouteReadService
{
    private const PROJECTION_MONTHS = 24;

    public function __construct(private readonly CardInvoiceSummaryService $invoiceSummaries) {}

    /** @return array<string, mixed> */
    public function build(int $userId, string $firstMonth, int $projectionMonths = self::PROJECTION_MONTHS): array
    {
        return DB::transaction(function () use ($userId, $firstMonth, $projectionMonths): array {
            $today = now()->toDateString();
            $windowStart = $firstMonth.'-01';
            $windowEnd = (new \\DateTimeImmutable($windowStart))->modify('+'.$projectionMonths.' months -1 day')->format('Y-m-d');
            $actualWindowEnd = min($windowEnd, $today);
            $accountIds = FinancialAccount::query()
                ->where('user_id', $userId)
                ->whereIn('account_type', ['BANK', 'CASH', 'WALLET'])
                ->pluck('id')
                ->map(fn ($id): int => (int) $id)
                ->all();

            $actualNetByDate = [];
            $actualFlowByDate = [];
            $plannedFlowByDate = [];
            $plannedNetByDate = [];
            $operationIdsByDate = [];
            $invoiceIdsByDate = [];
            $overdueItems = [];
            $referenceBalance = '0.0000';
            $referenceBalanceValid = true;
            $projectionValid = true;

            if ($accountIds !== []) {
                $realizedAggregate = DB::table('financial_entries')
                    ->where('user_id', $userId)
                    ->whereIn('account_id', $accountIds)
                    ->where('state', 'REALIZED')
                    ->selectRaw("COALESCE(SUM(CASE WHEN effect = 'INCREASE' THEN amount WHEN effect = 'DECREASE' THEN -amount ELSE 0 END), 0) as balance")
                    ->selectRaw("COALESCE(SUM(CASE WHEN effective_at IS NULL OR amount < 0 OR effect NOT IN ('INCREASE', 'DECREASE') THEN 1 ELSE 0 END), 0) as invalid_count")
                    ->selectRaw('COALESCE(SUM(CASE WHEN effective_at > ? THEN 1 ELSE 0 END), 0) as future_count', [$today])
                    ->whereDate('effective_at', '<=', $today)
                    ->first();

                $referenceBalance = bcadd((string) ($realizedAggregate->balance ?? '0'), '0', 4);
                $referenceBalanceValid = (int) ($realizedAggregate->invalid_count ?? 0) === 0;
                $projectionValid = (int) ($realizedAggregate->future_count ?? 0) === 0;

                $openingAggregate = DB::table('financial_entries')
                    ->where('user_id', $userId)
                    ->whereIn('account_id', $accountIds)
                    ->where('state', 'REALIZED')
                    ->whereNotNull('effective_at')
                    ->whereDate('effective_at', '<', $windowStart)
                    ->whereDate('effective_at', '<=', $today)
                    ->where('amount', '>=', 0)
                    ->whereIn('effect', ['INCREASE', 'DECREASE'])
                    ->selectRaw("COALESCE(SUM(CASE WHEN effect = 'INCREASE' THEN amount WHEN effect = 'DECREASE' THEN -amount ELSE 0 END), 0) as balance")
                    ->value('balance');
                $openingBalanceBeforeWindow = bcadd((string) ($openingAggregate ?? '0'), '0', 4);

                $entries = FinancialEntry::query()
                    ->where('user_id', $userId)
                    ->whereIn('account_id', $accountIds)
                    ->where('state', 'REALIZED')
                    ->whereNotNull('effective_at')
                    ->whereDate('effective_at', '>=', $windowStart)
                    ->whereDate('effective_at', '<=', $actualWindowEnd)
                    ->where('amount', '>=', 0)
                    ->whereIn('effect', ['INCREASE', 'DECREASE'])
                    ->with('operation:id,operation_type,state')
                    ->get();

                foreach ($entries as $entry) {
                    $effectiveDate = $entry->effective_at?->toDateString();
                    if ($effectiveDate === null) {
                        continue;
                    }
                    $amount = (string) $entry->amount;
                    $signedAmount = $entry->effect === 'INCREASE'
                        ? bcadd($amount, '0', 4)
                        : bcsub('0', $amount, 4);
                    $actualNetByDate[$effectiveDate] = bcadd($actualNetByDate[$effectiveDate] ?? '0.0000', $signedAmount, 4);

                    $operation = $entry->operation;
                    $operationType = $operation?->operation_type;
                    if ($operationType !== 'TRANSFER' && $operationType !== 'ACCOUNT_OPENING_BALANCE') {
                        $nature = $entry->effect === 'INCREASE' ? 'income' : 'expenses';
                        $this->addFlow($actualFlowByDate, $effectiveDate, $nature, $amount);
                    }
                    if ($operation !== null && $operationType !== 'ACCOUNT_OPENING_BALANCE') {
                        $this->addId($operationIdsByDate, $effectiveDate, (int) $operation->id);
                    }
                }
            } else {
                $openingBalanceBeforeWindow = '0.0000';
            }

            $pendingOperations = Operation::query()
                ->where('user_id', $userId)
                ->where(function ($query) use ($windowEnd): void {
                    $query->whereNull('planned_at')->orWhereDate('planned_at', '<=', $windowEnd);
                })
                ->where('state', 'PENDING')
                ->whereIn('operation_type', ['EXPENSE', 'INCOME'])
                ->get();

            foreach ($pendingOperations as $operation) {
                $date = $operation->planned_at?->toDateString();
                $amount = (string) $operation->amount;
                if (bccomp($amount, '0', 4) <= 0) {
                    $projectionValid = false;

                    continue;
                }

                $nature = $operation->operation_type === 'INCOME' ? 'INCOME' : 'EXPENSE';
                if ($date === null) {
                    $projectionValid = false;
                    $overdueItems[] = $this->overdueOperation($operation, null, $amount, $nature);

                    continue;
                }
                if ($date < $today) {
                    $overdueItems[] = $this->overdueOperation($operation, $date, $amount, $nature);

                    continue;
                }

                $flowNature = $nature === 'INCOME' ? 'income' : 'expenses';
                $this->addFlow($plannedFlowByDate, $date, $flowNature, $amount);
                $net = $nature === 'INCOME' ? bcadd($amount, '0', 4) : bcsub('0', $amount, 4);
                $plannedNetByDate[$date] = bcadd($plannedNetByDate[$date] ?? '0.0000', $net, 4);
                $this->addId($operationIdsByDate, $date, (int) $operation->id);
            }

            $invoices = CardInvoice::query()
                ->where('user_id', $userId)
                ->where(function ($query) use ($windowEnd): void {
                    $query->whereNull('due_date')->orWhereDate('due_date', '<=', $windowEnd);
                })
                ->with('card:id,name')
                ->orderBy('due_date')
                ->get();
            $invoiceSummaries = $this->invoiceSummaries->forInvoices($invoices->pluck('id')->all());

            foreach ($invoices as $invoice) {
                $summary = $invoiceSummaries[$invoice->id] ?? ['open_amount' => '0.0000'];
                $amount = $summary['open_amount'];
                if (bccomp($amount, '0', 4) <= 0) {
                    continue;
                }

                $dueDate = $invoice->due_date?->toDateString();
                if ($dueDate === null || $dueDate < $today) {
                    if ($dueDate === null) {
                        $projectionValid = false;
                    }
                    $overdueItems[] = [
                        'id' => 'invoice-'.$invoice->id,
                        'type' => 'invoice',
                        'invoice_id' => (int) $invoice->id,
                        'operation_id' => null,
                        'date' => $dueDate,
                        'label' => ($invoice->card?->name ? $invoice->card->name.' · ' : '').($dueDate === null ? 'Fatura sem vencimento' : 'Fatura vencida'),
                        'amount' => $amount,
                        'nature' => 'EXPENSE',
                    ];

                    continue;
                }

                $this->addFlow($plannedFlowByDate, $dueDate, 'expenses', $amount);
                $plannedNetByDate[$dueDate] = bcsub($plannedNetByDate[$dueDate] ?? '0.0000', $amount, 4);
                $this->addId($invoiceIdsByDate, $dueDate, (int) $invoice->id);
            }

            $overdueTotal = '0.0000';
            foreach ($overdueItems as $item) {
                if ($item['nature'] === 'EXPENSE') {
                    $overdueTotal = bcadd($overdueTotal, $item['amount'], 4);
                }
            }

            $actualDates = array_keys($actualNetByDate);
            sort($actualDates);
            $actualPrefix = [];
            $actualRunning = '0.0000';
            foreach ($actualDates as $effectDate) {
                $actualRunning = bcadd($actualRunning, $actualNetByDate[$effectDate], 4);
                $actualPrefix[] = $actualRunning;
            }

            $plannedDates = array_keys($plannedNetByDate);
            sort($plannedDates);
            $plannedPrefix = [];
            $plannedRunning = '0.0000';
            foreach ($plannedDates as $effectDate) {
                $plannedRunning = bcadd($plannedRunning, $plannedNetByDate[$effectDate], 4);
                $plannedPrefix[] = $plannedRunning;
            }

            $prefixAt = static function (array $dates, array $prefix, string $date): string {
                $low = 0;
                $high = count($dates) - 1;
                $found = -1;
                while ($low <= $high) {
                    $middle = intdiv($low + $high, 2);
                    if ($dates[$middle] <= $date) {
                        $found = $middle;
                        $low = $middle + 1;
                    } else {
                        $high = $middle - 1;
                    }
                }

                return $found < 0 ? '0.0000' : $prefix[$found];
            };

            $plannedBeforeToday = $prefixAt($plannedDates, $plannedPrefix, $this->shiftDate($today, -1));
            $balanceCache = [];
            $balanceAt = function (string $date) use (&$balanceCache, $referenceBalance, $referenceBalanceValid, $projectionValid, $openingBalanceBeforeWindow, $actualDates, $actualPrefix, $plannedDates, $plannedPrefix, $plannedBeforeToday, $prefixAt, $today): ?string {
                if (array_key_exists($date, $balanceCache)) {
                    return $balanceCache[$date];
                }
                if ($referenceBalanceValid === false) {
                    return null;
                }

                if ($date < $today) {
                    $actualThroughDate = $prefixAt($actualDates, $actualPrefix, $date);
                    $balance = bcadd($openingBalanceBeforeWindow, $actualThroughDate, 4);
                } else {
                    if ($projectionValid === false) {
                        return null;
                    }
                    $plannedThroughDate = $prefixAt($plannedDates, $plannedPrefix, $date);
                    $plannedSinceToday = bcsub($plannedThroughDate, $plannedBeforeToday, 4);
                    $balance = bcadd($referenceBalance, $plannedSinceToday, 4);
                }

                $balanceCache[$date] = $balance;

                return $balance;
            };

            $months = [];
            for ($index = 0; $index < $projectionMonths; $index++) {
                $month = $this->shiftMonth($firstMonth, $index);
                $bounds = $this->monthBounds($month);
                $days = [];
                $incomeTotal = '0.0000';
                $expensesTotal = '0.0000';

                for ($day = 1; $day <= $bounds['days']; $day++) {
                    $date = $bounds['prefix'].str_pad((string) $day, 2, '0', STR_PAD_LEFT);
                    $actual = $actualFlowByDate[$date] ?? ['income' => '0.0000', 'expenses' => '0.0000'];
                    $planned = $date >= $today
                        ? ($plannedFlowByDate[$date] ?? ['income' => '0.0000', 'expenses' => '0.0000'])
                        : ['income' => '0.0000', 'expenses' => '0.0000'];
                    $income = bcadd($actual['income'], $planned['income'], 4);
                    $expenses = bcadd($actual['expenses'], $planned['expenses'], 4);
                    $incomeTotal = bcadd($incomeTotal, $income, 4);
                    $expensesTotal = bcadd($expensesTotal, $expenses, 4);

                    $days[] = [
                        'date' => $date,
                        'income' => $income,
                        'expenses' => $expenses,
                        'balance' => $balanceAt($date),
                        'operation_ids' => $operationIdsByDate[$date] ?? [],
                        'invoice_ids' => $invoiceIdsByDate[$date] ?? [],
                    ];
                }

                $previousDate = $this->shiftDate($bounds['first'], -1);
                $months[] = [
                    'month' => $month,
                    'days' => $days,
                    'totals' => ['income' => $incomeTotal, 'expenses' => $expensesTotal],
                    'opening_balance' => $balanceAt($previousDate),
                    'ending_balance' => $balanceAt($bounds['last']),
                ];
            }

            return [
                'reference_date' => $today,
                'reference_balance' => $referenceBalanceValid ? $referenceBalance : null,
                'months' => $months,
                'overdue_items' => $overdueItems,
                'overdue_total' => $overdueTotal,
            ];
        });
    }

    /** @param array<string, array{income:string,expenses:string}> $map */
    private function addFlow(array &$map, string $date, string $nature, string $amount): void
    {
        $flow = $map[$date] ?? ['income' => '0.0000', 'expenses' => '0.0000'];
        $flow[$nature] = bcadd($flow[$nature], $amount, 4);
        $map[$date] = $flow;
    }

    /** @param array<string, int[]> $map */
    private function addId(array &$map, string $date, int $id): void
    {
        $ids = $map[$date] ?? [];
        if (! in_array($id, $ids, true)) {
            $ids[] = $id;
        }
        $map[$date] = $ids;
    }

    /** @return array<string, mixed> */
    private function overdueOperation(Operation $operation, ?string $date, string $amount, string $nature): array
    {
        return [
            'id' => 'operation-'.$operation->id,
            'type' => 'operation',
            'invoice_id' => null,
            'operation_id' => (int) $operation->id,
            'date' => $date,
            'label' => $operation->description ?: ($nature === 'INCOME' ? 'Ganho pendente' : 'Gasto pendente'),
            'amount' => bcadd($amount, '0', 4),
            'nature' => $nature,
        ];
    }

    private function shiftDate(string $date, int $days): string
    {
        return (new \DateTimeImmutable($date))->modify(($days >= 0 ? '+' : '').$days.' days')->format('Y-m-d');
    }

    private function shiftMonth(string $month, int $offset): string
    {
        return (new \DateTimeImmutable($month.'-01'))->modify(($offset >= 0 ? '+' : '').$offset.' months')->format('Y-m');
    }

    /** @return array{first:string,last:string,days:int} */
    private function monthBounds(string $month): array
    {
        $first = new \DateTimeImmutable($month.'-01');

        return [
            'first' => $first->format('Y-m-01'),
            'prefix' => $first->format('Y-m-'),
            'last' => $first->modify('last day of this month')->format('Y-m-d'),
            'days' => (int) $first->format('t'),
        ];
    }
}
