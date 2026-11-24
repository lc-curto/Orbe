# 11 — Contrato mínimo de transferências

> Fase 2 autorizada em 2026-11-24.

Uma transferência é uma única `operation` de tipo `TRANSFER` com exatamente duas `transfer_legs`: uma `OUT` e uma `IN`. Ambas têm o mesmo valor, contas diferentes e pertencem ao mesmo utilizador.

Cada perna mantém `account_id`, `direction`, `amount`, `state`, `planned_at` e `effective_at`. Os estados permitidos são `PENDING`, `REALIZED` e `CANCELLED`; nesta fase, a criação aceita `PENDING` ou `REALIZED` e a confirmação transforma uma perna pendente em realizada. Uma perna realizada cria exatamente um `financial_entry`: `OUT` usa `DECREASE`, `IN` usa `INCREASE`. Pernas pendentes não criam efeitos.

O estado da operação é derivado das duas pernas: ambas pendentes resultam em `PENDING`, ambas realizadas em `REALIZED`, ambas canceladas em `CANCELLED` e qualquer combinação intermédia em `PARTIAL`. Transferências parciais não são convertidas em receita ou despesa.

## Endpoints

- `POST /api/transfers` cria a operação e as duas pernas.
- `POST /api/operations/{operation}/transfer-legs/{leg}/confirm` confirma uma perna pendente.

O payload de criação contém `amount`, opcionalmente `description` e `idempotency_key`, e `legs.out`/`legs.in` com `account_id`, `state` e a data correspondente. A criação é atómica e adquire os locks das contas por ordem crescente de ID para reduzir deadlocks concorrentes.

O sistema rejeita a mesma conta nas duas pernas, contas de outro utilizador, contas inativas, estados sem a data correspondente e valores não positivos. A repetição da mesma chave de idempotência devolve a operação original.
