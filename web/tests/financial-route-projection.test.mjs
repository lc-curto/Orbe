import assert from 'node:assert/strict'
import test from 'node:test'
import { formatMoneyUnits, parseMoneyUnits } from '../src/features/financial-route/projection.ts'

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
