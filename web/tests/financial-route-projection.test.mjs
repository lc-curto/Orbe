import assert from 'node:assert/strict'
import test from 'node:test'
import { buildFinancialRouteProjection, formatMoneyUnits } from '../src/features/financial-route/projection.ts'

const bank = { id: 1, user_id: 7, name: 'Conta', account_type: 'BANK', status: 'ACTIVE' }
const opening = {
  id: 1,
  operation_type: 'ACCOUNT_OPENING_BALANCE',
  state: 'REALIZED',
  amount: '1000.0000',
  effective_at: '2026-11-01T12:00:00',
  entries: [{ id: 1, amount: '1000.0000', effect: 'INCREASE', state: 'REALIZED', effective_at: '2026-11-01T12:00:00', account_id: 1 }],
}

test('acumula o saldo diariamente e transporta o fecho de novembro para dezembro', () => {
  const projection = buildFinancialRouteProjection([
    opening,
    { id: 2, operation_type: 'EXPENSE', state: 'PENDING', amount: '100.0000', planned_at: '2026-11-30T12:00:00', description: 'Gasto novembro' },
    { id: 3, operation_type: 'INCOME', state: 'PENDING', amount: '250.0000', planned_at: '2026-12-01T12:00:00', description: 'Ganho dezembro' },
  ], [bank], [], '2026-11', 2, new Date('2026-11-27T12:00:00'))

  assert.equal(projection.referenceBalance, 10000000n)
  assert.equal(projection.months[0].days[29].balance, 9000000n)
  assert.equal(projection.months[0].endingBalance, 9000000n)
  assert.equal(projection.months[1].days[0].balance, 11500000n)
})

test('realizados já incluídos no saldo de referência não são reaplicados', () => {
  const realizedExpense = {
    id: 2,
    operation_type: 'EXPENSE',
    state: 'REALIZED',
    amount: '200.0000',
    effective_at: '2026-11-25T12:00:00',
    entries: [{ id: 2, amount: '200.0000', effect: 'DECREASE', state: 'REALIZED', effective_at: '2026-11-25T12:00:00', account_id: 1 }],
  }
  const projection = buildFinancialRouteProjection([opening, realizedExpense], [bank], [], '2026-11', 1, new Date('2026-11-27T12:00:00'))

  assert.equal(projection.referenceBalance, 8000000n)
  assert.equal(projection.months[0].days[26].balance, 8000000n)
  assert.equal(projection.months[0].days[24].balance, 8000000n)
  assert.equal(projection.months[0].days[23].balance, 10000000n)
})

test('projeta a fatura uma única vez no vencimento, sem somar a compra do cartão', () => {
  const purchase = {
    id: 3,
    operation_type: 'PURCHASE',
    state: 'REALIZED',
    amount: '150.0000',
    effective_at: '2026-11-20T12:00:00',
    entries: [{ id: 3, amount: '150.0000', effect: 'DECREASE', state: 'REALIZED', effective_at: '2026-11-20T12:00:00', invoice_id: 9 }],
  }
  const invoice = {
    id: 9,
    card_id: 2,
    period_start: '2026-11-01',
    period_end: '2026-11-30',
    due_date: '2026-12-05',
    cycle_state: 'CLOSED',
    summary: { obligation_amount: '150.0000', paid_amount: '0.0000', open_amount: '150.0000' },
    card: { id: 2, name: 'Cartão', credit_limit: '1000.0000', status: 'ACTIVE', summary: { used_amount: '150.0000', available_amount: '850.0000' } },
  }
  const projection = buildFinancialRouteProjection([opening, purchase], [bank], [invoice], '2026-11', 2, new Date('2026-11-27T12:00:00'))

  assert.equal(projection.months[0].totals.expenses, 0n)
  assert.equal(projection.months[1].days[4].expenses, 1500000n)
  assert.equal(projection.months[1].days[4].invoices.length, 1)
  assert.equal(projection.months[1].days[4].balance, 8500000n)
})

test('itens vencidos não são reagendados nem descontados novamente do saldo', () => {
  const projection = buildFinancialRouteProjection([
    opening,
    { id: 4, operation_type: 'EXPENSE', state: 'PENDING', amount: '50.0000', planned_at: '2026-11-20T12:00:00', description: 'Pendente vencido' },
  ], [bank], [{
    id: 10, card_id: 2, period_start: '2026-10-01', period_end: '2026-10-31', due_date: '2026-11-20',
    cycle_state: 'CLOSED', summary: { obligation_amount: '100.0000', paid_amount: '0.0000', open_amount: '100.0000' },
  }], '2026-11', 1, new Date('2026-11-27T12:00:00'))

  assert.equal(projection.months[0].days[19].expenses, 0n)
  assert.equal(projection.months[0].days[26].balance, 10000000n)
  assert.equal(projection.overdueTotal, 1500000n)
  assert.equal(projection.overdueItems.length, 2)
})

test('formata moeda com arredondamento half-up sem sinal negativo em zero', () => {
  assert.equal(formatMoneyUnits(123456789n), '12.345,68')
  assert.equal(formatMoneyUnits(-49n), '0,00')
  assert.equal(formatMoneyUnits(-50n), '−0,01')
})
