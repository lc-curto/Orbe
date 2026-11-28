import assert from 'node:assert/strict'
import test from 'node:test'
import { formatMoneyUnits, isDisplayedNegative, localDateKey, parseMoneyUnits, projectionMonthEnd } from '../src/features/financial-route/projection.ts'

test('converte valores DECIMAL para unidades inteiras sem precisão binária', () => {
  assert.equal(parseMoneyUnits('123.4567'), 1234567n)
  assert.equal(parseMoneyUnits('-0.0001'), -1n)
  assert.equal(parseMoneyUnits('12.34567'), null)
})

test('formata moeda em pt-PT com arredondamento half-up', () => {
  assert.equal(formatMoneyUnits(123456789n), '12 345,68')
  assert.equal(formatMoneyUnits(-49n), '0,00')
  assert.equal(formatMoneyUnits(-50n), '−0,01')
})

test('sinal negativo segue o valor monetário arredondado que o utilizador vê', () => {
  assert.equal(isDisplayedNegative(-49n), false)
  assert.equal(isDisplayedNegative(-50n), true)
  assert.equal(isDisplayedNegative(50n), false)
})

test('janela móvel usa meses consecutivos e a data local do dia atual', () => {
  assert.equal(localDateKey(new Date(2026, 10, 27, 12)), '2026-11-27')
  assert.equal(projectionMonthEnd('2026-11', 24), '2028-10')
  assert.equal(projectionMonthEnd('2026-12', 24), '2028-11')
})
