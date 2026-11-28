<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for cash/account balances.
 *
 * Only realized financial entries with an effective date on or before the
 * requested cutoff affect the balance. Pending operations are projections,
 * not account balance entries.
 */
final class AccountBalanceService
{
    /**
     * @return array{accounts: array<int, string|null>, total: string|null, valid: bool, future_count: int}
     */
    public function snapshot(int $userId, ?string $asOfDate = null): array
    {
        $cutoff = ($asOfDate ?? now()->toDateString()).' 23:59:59';
        $accountIds = DB::table('financial_accounts')
            ->where('user_id', $userId)
            ->orderBy('id')
            ->pluck('id')
            ->map(static fn ($id): int => (int) $id)
            ->all();

        if ($accountIds === []) {
            return ['accounts' => [], 'total' => '0.0000', 'valid' => true, 'future_count' => 0];
        }

        $rows = DB::table('financial_entries')
            ->where('user_id', $userId)
            ->whereIn('account_id', $accountIds)
            ->where('state', 'REALIZED')
            ->groupBy('account_id')
            ->select('account_id')
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN effective_at <= ? AND effect = 'INCREASE' AND amount >= 0 THEN amount WHEN effective_at <= ? AND effect = 'DECREASE' AND amount >= 0 THEN -amount ELSE 0 END), 0) as balance",
                [$cutoff, $cutoff],
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN effective_at IS NULL OR amount < 0 OR effect NOT IN ('INCREASE', 'DECREASE') THEN 1 ELSE 0 END), 0) as invalid_count",
            )
            ->selectRaw('COALESCE(SUM(CASE WHEN effective_at > ? THEN 1 ELSE 0 END), 0) as future_count', [$cutoff])
            ->get()
            ->keyBy('account_id');

        $balances = [];
        $total = '0.0000';
        $valid = true;
        $futureCount = 0;

        foreach ($accountIds as $accountId) {
            $row = $rows->get($accountId);
            $accountValid = (int) ($row->invalid_count ?? 0) === 0;
            $balance = $accountValid ? bcadd((string) ($row->balance ?? '0'), '0', 4) : null;
            $balances[$accountId] = $balance;
            if ($balance === null) {
                $valid = false;
            } else {
                $total = bcadd($total, $balance, 4);
            }
            $futureCount += (int) ($row->future_count ?? 0);
        }

        return [
            'accounts' => $balances,
            'total' => $valid ? $total : null,
            'valid' => $valid,
            'future_count' => $futureCount,
        ];
    }
}
