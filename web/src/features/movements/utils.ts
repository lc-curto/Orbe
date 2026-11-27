import type { Operation } from '../../api/types'

export function typeLabel(type: string) {
  return ({ EXPENSE: 'Gasto', INCOME: 'Ganho', TRANSFER: 'Transferência' } as Record<string, string>)[type] ?? type
}

export function stateLabel(state: string) {
  return ({ PENDING: 'Pendente', REALIZED: 'Realizada', CANCELLED: 'Cancelada', ACTIVE: 'Ativa', PAUSED: 'Pausada', ENDED: 'Terminada' } as Record<string, string>)[state] ?? state
}

export function movementName(operation: Operation) {
  return operation.description || typeLabel(operation.operation_type)
}

export function movementAccount(operation: Operation) {
  return operation.account?.name ?? operation.entries?.find((entry) => entry.account)?.account?.name ?? 'Conta não identificada'
}
