<?php

declare(strict_types=1);

use App\Models\Operation;
use App\Services\PaymentAllocationService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

[$script, $barrier, $paymentId, $settlementId, $obligationId, $amount] = $argv;

while (!is_file($barrier)) {
    usleep(10_000);
}

try {
    app(PaymentAllocationService::class)->allocate(
        Operation::query()->findOrFail((int) $paymentId),
        (int) $settlementId,
        [['obligation_entry_id' => (int) $obligationId, 'amount' => $amount]],
    );
    echo json_encode(['status' => 'accepted'], JSON_THROW_ON_ERROR);
    exit(0);
} catch (Throwable $exception) {
    echo json_encode(['status' => 'rejected', 'type' => $exception::class], JSON_THROW_ON_ERROR);
    exit(0);
}
