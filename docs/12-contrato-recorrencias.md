# 12 — Contrato mínimo de recorrências

> Fase 3 autorizada em 2026-11-24.

## Entidades

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

## Endpoints

- `POST /api/recurrences`
- `GET /api/recurrences`
- `POST /api/recurrences/{schedule}/generate`
- `GET /api/recurrences/{schedule}/occurrences?until=...`
- `POST /api/recurrence-occurrences/{occurrence}/materialize`
- `PATCH /api/recurrence-occurrences/{occurrence}`
- `PATCH /api/recurrence-occurrences/{occurrence}/and-following`
- `POST /api/recurrence-occurrences/{occurrence}/cancel`
