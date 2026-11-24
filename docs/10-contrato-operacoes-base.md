# 10 — Contrato mínimo de operações base

> Fase 1 autorizada em 2026-11-24. Este contrato cobre apenas contas, categorias, despesas comuns e receitas.

## Entidades

### Conta financeira

`financial_accounts` mantém `user_id`, `name`, `account_type` e `status`. Os tipos mínimos são `BANK`, `CASH` e `WALLET`. Apenas contas `ACTIVE` podem receber novos efeitos.

### Categoria

`categories` mantém `user_id`, `name`, `nature` e `status`. A natureza é `EXPENSE` ou `INCOME`; uma operação só pode usar categoria da mesma natureza. A unicidade é por utilizador, nome e natureza.

### Operação base

Uma operação de despesa ou receita mantém:

- `operation_type`: `EXPENSE` ou `INCOME`;
- `amount`: positivo e persistido em `DECIMAL(19,4)`;
- `account_id`: conta selecionada para o efeito, inclusive enquanto a operação está pendente;
- `category_id`: categoria da mesma natureza e utilizador;
- `description`: opcional, até 500 caracteres;
- `state`: `REALIZED` ou `PENDING` nesta fase;
- `effective_at` para operações realizadas;
- `planned_at` para operações pendentes;
- `idempotency_key` opcional, única por utilizador quando informada.

Uma operação `REALIZED` cria exatamente um `financial_entry` dirigido à conta. Despesa usa efeito `DECREASE`; receita usa `INCREASE`. Uma operação `PENDING` não cria lançamento efetivo. A confirmação é explícita e cria o lançamento uma única vez.

## Endpoints

Todos exigem Sanctum e isolamento pelo utilizador autenticado:

- `GET /api/accounts`
- `POST /api/accounts` com `name` e `account_type`
- `GET /api/categories?nature=EXPENSE|INCOME`
- `POST /api/categories` com `name` e `nature`
- `POST /api/expenses`
- `POST /api/incomes`
- `POST /api/operations/{operation}/confirm`

O payload de despesa/receita contém `amount`, `account_id`, `category_id`, `state`, `effective_at` ou `planned_at`, e opcionalmente `description` e `idempotency_key`.

## Limites desta fase

Esta fase não implementa edição, eliminação, cancelamento, transferências, recorrências, cartões, pagamentos ou gestão de dívidas. Esses fluxos mantêm os contratos próprios e serão implementados nas fases seguintes.
