# 06 — Contratos da API

> Contratos de escrita e leitura da API agrupados por domínio. Um contrato novo deve ser acrescentado aqui, não num ficheiro isolado.

---

> Fase 1 autorizada em 2026-11-24. Este contrato cobre apenas contas, categorias, despesas comuns e receitas.

## Entidades — operações base

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

## Endpoints — operações base

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

---

> Fase 2 autorizada em 2026-11-24.

Uma transferência é uma única `operation` de tipo `TRANSFER` com exatamente duas `transfer_legs`: uma `OUT` e uma `IN`. Ambas têm o mesmo valor, contas diferentes e pertencem ao mesmo utilizador.

Cada perna mantém `account_id`, `direction`, `amount`, `state`, `planned_at` e `effective_at`. Os estados permitidos são `PENDING`, `REALIZED` e `CANCELLED`; nesta fase, a criação aceita `PENDING` ou `REALIZED` e a confirmação transforma uma perna pendente em realizada. Uma perna realizada cria exatamente um `financial_entry`: `OUT` usa `DECREASE`, `IN` usa `INCREASE`. Pernas pendentes não criam efeitos.

O estado da operação é derivado das duas pernas: ambas pendentes resultam em `PENDING`, ambas realizadas em `REALIZED`, ambas canceladas em `CANCELLED` e qualquer combinação intermédia em `PARTIAL`. Transferências parciais não são convertidas em receita ou despesa.

## Endpoints — transferências

- `POST /api/transfers` cria a operação e as duas pernas.
- `POST /api/operations/{operation}/transfer-legs/{leg}/confirm` confirma uma perna pendente.

O payload de criação contém `amount`, opcionalmente `description` e `idempotency_key`, e `legs.out`/`legs.in` com `account_id`, `state` e a data correspondente. A criação é atómica e adquire os locks das contas por ordem crescente de ID para reduzir deadlocks concorrentes.

O sistema rejeita a mesma conta nas duas pernas, contas de outro utilizador, contas inativas, estados sem a data correspondente e valores não positivos. A repetição da mesma chave de idempotência devolve a operação original.

---

> Fase 3 autorizada em 2026-11-24.

## Entidades — recorrências

`recurrence_schedules` representa a programação. Mantém utilizador, natureza (`EXPENSE` ou `INCOME`), valor `DECIMAL(19,4)`, conta, categoria, descrição, periodicidade, primeira ocorrência, estado, data de fim opcional e chave de idempotência.

As periodicidades mínimas são `DAILY`, `WEEKLY` e `MONTHLY`. Não são suportados calendários complexos, dias úteis ou exceções nesta fase. Os estados da programação são `ACTIVE`, `PAUSED` e `ENDED`; apenas `ACTIVE` gera novas ocorrências.

`recurrence_occurrences` representa cada ocorrência individual. Mantém data prevista, valor, conta, categoria, descrição resolvida, estado, operação materializada opcional e data efetiva. Os estados mínimos são `PENDING`, `REALIZED` e `CANCELLED`.

Existe uma unicidade por programação e data prevista. Uma ocorrência pode referenciar no máximo uma operação, protegida por unicidade na coluna `operation_id`.

## Geração

A criação de uma programação cria a primeira ocorrência. A geração adicional é feita com uma data limite explícita através de `POST /api/recurrences/{schedule}/generate` ou do parâmetro `until` da listagem. Repetições são idempotentes e não duplicam ocorrências.

Ocorrências `PENDING` não criam `financial_entries`. A materialização é explícita e reutiliza o serviço de despesas/receitas existente, numa transação. A chave `recurrence-occurrence-{id}` impede a criação de duas operações para a mesma ocorrência.

## Alterações e cancelamento

`PATCH /api/recurrence-occurrences/{occurrence}` altera apenas uma ocorrência pendente futura.

`PATCH /api/recurrence-occurrences/{occurrence}/and-following` atualiza a programação e a ocorrência selecionada, bem como todas as ocorrências seguintes que ainda estejam `PENDING`. Ocorrências `REALIZED` e `CANCELLED` são preservadas.

`POST /api/recurrence-occurrences/{occurrence}/cancel` cancela apenas a ocorrência selecionada e não a programação inteira.

Ocorrências realizadas ou passadas não podem ser reescritas. Todas as operações exigem Sanctum e respeitam o isolamento por utilizador.

## Endpoints — recorrências

- `POST /api/recurrences`
- `GET /api/recurrences`
- `POST /api/recurrences/{schedule}/generate`
- `GET /api/recurrences/{schedule}/occurrences?until=...`
- `POST /api/recurrence-occurrences/{occurrence}/materialize`
- `PATCH /api/recurrence-occurrences/{occurrence}`
- `PATCH /api/recurrence-occurrences/{occurrence}/and-following`
- `POST /api/recurrence-occurrences/{occurrence}/cancel`
