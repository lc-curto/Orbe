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
    public function __construct(private readonly CardInvoiceSummaryService $invoiceSummaries) {}

    /** @return array<string, mixed> */
    public function build(int $userId, string $firstMonth): array
    {
        return DB::transaction(function () use ($userId, $firstMonth): array {
            $today = now()->toDateString();
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

            $entries = $accountIds === []
                ? collect()
                : FinancialEntry::query()
                    ->where('user_id', $userId)
                    ->whereIn('account_id', $accountIds)
                    ->where('state', 'REALIZED')
                    ->with('operation:id,operation_type,state')
                    ->get();

            foreach ($entries as $entry) {
                $effectiveDate = $entry->effective_at?->toDateString();
                $amount = (string) $entry->amount;
                if ($effectiveDate === null || bccomp($amount, '0', 4) < 0) {
                    $referenceBalanceValid = false;

                    continue;
                }

                if ($entry->effect === 'INCREASE') {
                    $signedAmount = bcadd($amount, '0', 4);
                } elseif ($entry->effect === 'DECREASE') {
                    $signedAmount = bcsub('0', $amount, 4);
                } else {
                    $referenceBalanceValid = false;

                    continue;
                }

                if ($effectiveDate > $today) {
                    $projectionValid = false;

                    continue;
                }

                $referenceBalance = bcadd($referenceBalance, $signedAmount, 4);
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

            $pendingOperations = Operation::query()
                ->where('user_id', $userId)
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

            $balanceCache = [];
            $balanceAt = function (string $date) use (&$balanceCache, $referenceBalance, $referenceBalanceValid, $projectionValid, $actualNetByDate, $plannedNetByDate, $today): ?string {
                if (array_key_exists($date, $balanceCache)) {
                    return $balanceCache[$date];
                }
                if (! $referenceBalanceValid) {
                    return null;
                }

                if ($date < $today) {
                    $netAfter = '0.0000';
                    foreach ($actualNetByDate as $effectDate => $net) {
                        if ($effectDate > $date && $effectDate <= $today) {
                            $netAfter = bcadd($netAfter, $net, 4);
                        }
                    }
                    $balance = bcsub($referenceBalance, $netAfter, 4);
                } else {
                    if (! $projectionValid) {
                        return null;
                    }
                    $balance = bcadd($referenceBalance, $plannedNetByDate[$today] ?? '0.0000', 4);
                    foreach ($plannedNetByDate as $effectDate => $net) {
                        if ($effectDate > $today && $effectDate <= $date) {
                            $balance = bcadd($balance, $net, 4);
                        }
                    }
                }

                $balanceCache[$date] = $balance;

                return $balance;
            };

            $months = [];
            for ($index = 0; $index < 3; $index++) {
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
