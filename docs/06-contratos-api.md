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
- `account_id`: destino da operação quando `REALIZED`; omitido/nulo enquanto `PENDING`. Nesta Fase 1, a realização de gasto/ganho comum exige uma conta ativa. Cartão/fatura e outros destinos só podem ser usados quando existir contrato próprio para o fluxo;
- `category_id`: categoria da mesma natureza e utilizador;
- `description`: opcional, até 500 caracteres;
- `state`: `REALIZED` ou `PENDING` nesta fase;
- `effective_at` para operações realizadas;
- `planned_at` para operações pendentes;
- `idempotency_key` opcional, única por utilizador quando informada.

Uma operação `REALIZED` cria exatamente um `financial_entry` dirigido à conta. Despesa usa efeito `DECREASE`; receita usa `INCREASE`. Uma operação `PENDING` não tem destino financeiro associado, não apresenta nem exige conta/cartão/fatura e não cria lançamento efetivo. A confirmação como realizado exige fornecer e validar uma conta ativa antes de criar o lançamento, uma única vez. Na Fase 1, este contrato cobre apenas operações comuns por conta; cartão/fatura ou outros destinos exigem contrato específico.

## Endpoints — operações base

Todos exigem Sanctum e isolamento pelo utilizador autenticado:

- `GET /api/accounts`
- `POST /api/accounts` com `name` e `account_type`
- `GET /api/categories?nature=EXPENSE|INCOME`
- `POST /api/categories` com `name` e `nature`
- `POST /api/expenses`
- `POST /api/incomes`
- `POST /api/operations/{operation}/confirm`

O payload de despesa/receita contém `amount`, `category_id`, `state`, `effective_at` ou `planned_at`, e opcionalmente `description` e `idempotency_key`. `account_id` é omitido/nulo para `PENDING` e obrigatório para `REALIZED` nesta Fase 1. O formulário de pendente não envia nem apresenta destino financeiro. O endpoint de confirmação de operação pendente recebe `account_id` e valida que a conta está ativa antes de criar o lançamento. Cartões/faturas não estão cobertos por este contrato comum.

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

`recurrence_schedules` representa a programação. Mantém utilizador, natureza (`EXPENSE` ou `INCOME`), valor `DECIMAL(19,4)`, conta/destino opcional enquanto as ocorrências forem pendentes, categoria, descrição, periodicidade, primeira ocorrência, estado, data de fim opcional e chave de idempotência. Não exigir nem apresentar conta/cartão/meio de liquidação para ocorrências pendentes; o destino é recolhido na confirmação/materialização como realizado.

As periodicidades mínimas são `DAILY`, `WEEKLY` e `MONTHLY`. Não são suportados calendários complexos, dias úteis ou exceções nesta fase. Os estados da programação são `ACTIVE`, `PAUSED` e `ENDED`; apenas `ACTIVE` gera novas ocorrências.

`recurrence_occurrences` representa cada ocorrência individual. Mantém data prevista, valor, destino financeiro opcional enquanto `PENDING`, categoria, descrição resolvida, estado, operação materializada opcional e data efetiva. Uma ocorrência realizada exige destino válido; a materialização deve receber esse destino quando não estiver definido. Os estados mínimos são `PENDING`, `REALIZED` e `CANCELLED`.

Existe uma unicidade por programação e data prevista. Uma ocorrência pode referenciar no máximo uma operação, protegida por unicidade na coluna `operation_id`.

## Geração

A criação de uma programação cria a primeira ocorrência. A geração adicional é feita com uma data limite explícita através de `POST /api/recurrences/{schedule}/generate` ou do parâmetro `until` da listagem. Repetições são idempotentes e não duplicam ocorrências.

Ocorrências `PENDING` não têm destino financeiro e não criam `financial_entries`. A materialização/confirmacão como realizada é explícita, exige destino válido (conta ativa nesta Fase 1) e reutiliza o serviço de despesas/receitas existente, numa transação. A chave `recurrence-occurrence-{id}` impede a criação de duas operações para a mesma ocorrência.

## Alterações e cancelamento

`PATCH /api/recurrence-occurrences/{occurrence}` altera apenas uma ocorrência pendente futura.

`PATCH /api/recurrence-occurrences/{occurrence}/and-following` atualiza a programação e a ocorrência selecionada, bem como todas as ocorrências seguintes que ainda estejam `PENDING`. Ocorrências `REALIZED` e `CANCELLED` são preservadas.

`POST /api/recurrence-occurrences/{occurrence}/cancel` cancela apenas a ocorrência selecionada e não a programação inteira.

Ocorrências realizadas ou passadas não podem ser reescritas. Todas as operações exigem Sanctum e respeitam o isolamento por utilizador.

## Payloads de recorrência — destino na materialização

`POST /api/recurrences` cria uma programação pendente e não recebe `account_id`; as ocorrências geradas também ficam sem destino e sem lançamentos financeiros. `POST /api/recurrence-occurrences/{occurrence}/materialize` recebe `account_id` e `effective_at`; a conta é validada como pertencente ao utilizador e ativa antes de criar a operação realizada e o lançamento. O destino é gravado na ocorrência realizada para manter o histórico. As alterações de ocorrência pendente não permitem atribuir conta.

## Endpoints — recorrências

- `POST /api/recurrences`
- `GET /api/recurrences`
- `POST /api/recurrences/{schedule}/generate`
- `GET /api/recurrences/{schedule}/occurrences?until=...`
- `POST /api/recurrence-occurrences/{occurrence}/materialize`
- `PATCH /api/recurrence-occurrences/{occurrence}`
- `PATCH /api/recurrence-occurrences/{occurrence}/and-following`
- `POST /api/recurrence-occurrences/{occurrence}/cancel`

## Formulário de gasto — contrato futuro requerido (decisão 2026-11-27)

Este contrato descreve a extensão necessária para implementar o formulário aprovado. Os endpoints/payloads existentes de despesa comum não devem ser considerados suficientes até que os campos abaixo sejam implementados e testados. A forma final dos nomes pode seguir os padrões existentes, mas a semântica é obrigatória.

### Conta — imediato
- Criar gasto realizado com conta efetiva e data efetiva.
- A conta é uma conta ativa do utilizador; o pagamento e o reconhecimento da despesa são atómicos e idempotentes.

### Conta — data futura
- Criar gasto pendente com `planned_account_id` (conta ativa) e `due_at`.
- Não enviar `account_id` como destino efetivo; não criar `financial_entries` realizados nem alterar saldo atual.
- A leitura deve devolver conta prevista e data prevista para formulário, Movimentos e Rota Financeira.
- A confirmação posterior como pago recebe conta efetiva e `effective_at`, cria o lançamento e preserva a previsão/histórico conforme regras de auditoria.

### Conta — prestações
- Criar gasto/plano com conta prevista, total, número de prestações e vencimento da primeira; backend gera calendário e valores usando aritmética decimal definida em ARC-003.
- Opcionalmente, o comando pode incluir a primeira prestação paga, com conta efetiva e `effective_at`. A criação do plano e o pagamento inicial devem ser uma transação idempotente.
- A conta efetiva e a data do pagamento inicial são distintas da conta prevista e do vencimento da prestação.
- API de leitura deve expor estado e vencimento por prestação, incluindo prestações futuras, sem duplicar o gasto original.

### Cartão — compra única/parcelada
- Criar compra com `card_id`, data do gasto, valor total e indicador/número de prestações.
- Backend calcula e devolve as alocações para faturas conforme ciclo do cartão; cliente não envia vencimento manual nem fatura escolhida, salvo exceção de domínio documentada e aprovada.
- O contrato não aceita `first_installment_paid` no formulário de compra. Pagamentos são comandos separados de liquidação de fatura, com conta e data efetiva.
- Compra, alocações e eventuais efeitos de obrigação são persistidos atomicamente e com idempotência.

### Erros e validação
- Rejeitar conta/cartão de outro utilizador ou inativo, modalidade incompatível com método, número de prestações inválido, datas impossíveis e payload com destino previsto confundido com destino efetivo.
- Respostas de leitura devem permitir distinguir explicitamente `planned_account` de `effective_account`/lançamento, e `transaction_at`, `due_at` e `effective_at`.
- Atualizar schemas, exemplos, testes API, read models de Movimentos/Cartões/Rota e documentação frontend quando o contrato for implementado.

---


## Extensão necessária — formulários de gastos e ganhos (interface implementada, contrato por implementar)

Esta secção especifica o trabalho backend/API que falta para tornar funcionais as opções já desenhadas no formulário. É uma especificação de implementação; não afirma que os endpoints/campos já existem.

### 1. Gasto por Conta — imediato
- Reutilizar o contrato existente de `POST /expenses` com `state=REALIZED`, `account_id` e `effective_at`.
- Conta ativa e pertencente ao utilizador; criação da operação e lançamento na mesma transação.
- O formulário não deve enviar uma conta prevista neste caso.

### 2. Gasto por Conta — data futura
- Estender `POST /expenses` para aceitar `planned_account_id` e `planned_at` com `state=PENDING`.
- `planned_account_id` é referência de previsão, não destino efetivo: não cria `financial_entries` realizados nem altera saldo.
- Manter `account_id`/lançamento efetivo ausente até confirmação do pagamento.
- A confirmação futura recebe conta efetiva e `effective_at`; não deve inferir conta efetiva a partir da prevista.

### 3. Gasto por Conta — prestações
Contrato proposto para criação atómica:
- Dados do gasto: descrição, valor total, categoria, data do gasto e notas opcionais.
- Plano: `planned_account_id`, `installments_count` (2–120) e `first_due_at`.
- Pagamento inicial opcional: `first_installment_payment.account_id` e `first_installment_payment.effective_at`.
- Backend calcula prestações em aritmética decimal ARC-003, atribui o resíduo de arredondamento de forma determinística e cria calendário/obrigações.
- Se primeira prestação paga, liquida exatamente essa prestação, cria o efeito realizado na conta escolhida e reduz a obrigação; não cria uma segunda despesa.
- A conta efetiva inicial pode diferir da conta prevista do plano.
- Plano, prestações, operação original e pagamento inicial devem ser atómicos e idempotentes. Repetir a mesma chave não pode gerar novas prestações ou lançamentos.
- Read model expõe estado, valor, vencimento, valor pago/em aberto e relação com a operação original.

### 4. Compra de Cartão — única ou parcelada
- Alterar o contrato atual de `POST /purchases`, que hoje exige alocações de fatura fornecidas pelo cliente.
- Novo input de domínio: `card_id`, `purchased_at`, valor total, descrição/categoria/notas e `installments_count` (1 para compra única; >1 para parcelada), mais chave de idempotência.
- Backend valida cartão ativo/do utilizador, determina ciclo de cada prestação e calcula as alocações para faturas; não exigir `invoice_id`, vencimentos ou montantes de alocação manuais ao utilizador.
- Persistir compra e alocações numa transação; devolve a distribuição calculada para informação.
- Não aceitar `first_installment_paid` neste formulário. Liquidação de fatura é comando separado com conta e data efetiva.
- Compra reconhecida uma vez em Movimentos; Rota Financeira projeta o total de cada fatura uma única vez, sem projetar simultaneamente compras individuais dessa fatura.

### 5. Notas e ganhos
- Adicionar campo opcional `notes` ao contrato de gasto e rendimento e persistir no modelo/read model, com limite validado e sanitização adequada.
- Ganhos mantêm o fluxo atual: pendente sem conta efetiva; recebido exige conta + `effective_at`. Não adicionar método Conta/Cartão.
- Confirmar `planned_at` para rendimento pendente e `effective_at` para recebido; expor sem confundir as duas datas.

### 6. Integridade e testes obrigatórios
- Autorizar todas as referências por utilizador e estado ativo.
- Rejeitar quantidade inválida, datas incompatíveis, plano sem conta prevista e pagamento inicial incompleto.
- Transações DB, idempotência, concorrência e constraints adequadas.
- Testar cálculo decimal e última prestação, pagamento inicial, repetição de requests, faturas no dia de fecho (regra de ciclo pendente de decisão), conta prevista sem impacto no saldo, e invariantes de Movimentos/Contas/Cartões/Rota.
- Atualizar OpenAPI/exemplos, DTOs/requests, services, migrations, resources/read models e testes correspondentes.


## Rota Financeira — read model diário

**Implementado no PR #13 (branch aberta; ainda não integrado na `main`).** O endpoint é somente de leitura, exige autenticação Sanctum e aplica isolamento pelo utilizador autenticado.

- `GET /api/financial-route?month=YYYY-MM&months=N`
- `month` é opcional; por omissão usa o mês atual do backend. Quando informado, deve respeitar `YYYY-MM`; valor inválido retorna `422`.
- `months` é opcional, inteiro entre 1 e 24; por omissão é 24 para compatibilidade. O read model devolve exatamente a quantidade solicitada de meses consecutivos a partir do mês indicado. A web pede 3 meses visíveis no desktop e 1 no mobile; faz um segundo pedido cancelável em segundo plano para pré-carregar respetivamente mais 3 ou 1 mês. A cache é por mês, TTL 60 s, invalidada quando os dados financeiros são atualizados.
- O read model não é persistido. É calculado pelo `FinancialRouteReadService` em transação de leitura, com base nos lançamentos realizados elegíveis, operações pendentes e valores ainda por pagar das faturas. Os lançamentos realizados são materializados apenas no intervalo solicitado; saldo de referência e saldo de abertura são agregados em SQL. Operações pendentes e faturas são limitadas ao horizonte e vencidos relevantes. React apenas apresenta os valores e resolve os IDs para detalhes carregados. Os agregados de saldo ainda percorrem o histórico elegível no banco; snapshots/checkpoints transacionais são uma evolução necessária antes de históricos muito grandes, não uma funcionalidade já implementada. Limitação adicional: `GET /api/operations` ainda devolve todas as operações do utilizador, sem cursor/paginação, e o loader financeiro partilhado depende desse conjunto. A paginação por cursor, filtros aplicados no SQL e read models por ecrã são requisitos da próxima etapa de escala; não estão incluídos neste endpoint da Rota.

Campos da resposta `data`:

- `reference_date`: data local de referência (`YYYY-MM-DD`).
- `reference_balance`: saldo efetivo agregado das contas elegíveis, como string decimal; `null` quando não é possível determinar um saldo válido.
- `months[]`: `month` (`YYYY-MM`), `days[]`, `totals`, `opening_balance` e `ending_balance`. Cada dia contém `date`, `income`, `expenses`, `balance` (string decimal ou `null`), `operation_ids[]` e `invoice_ids[]`. Valores monetários são strings DECIMAL, sem conversão para `number` no frontend.
- `overdue_items[]`: operações/faturas vencidas ou sem data válida, com tipo, IDs, data, descrição, valor e natureza.
- `overdue_total`: total das saídas vencidas, como string decimal.

A projeção começa no saldo de referência e não reaplica efeitos realizados já incluídos nele. Pendentes vencidas permanecem no resumo de vencidos; não são realizadas nem reagendadas automaticamente. Faturas são agregadas pelo serviço comum de resumo e projetadas uma única vez.


## Contas — read model de saldos atuais

`GET /api/accounts` devolve cada conta com `current_balance` (`DECIMAL` como string ou `null`) calculado pelo `AccountBalanceService`. O saldo inclui apenas lançamentos `REALIZED` dirigidos à conta, com `effective_at` até ao fim do dia local atual. O lançamento de saldo inicial está incluído pela sua data efetiva. Pendentes/vencidos não entram neste saldo.

A resposta inclui `meta.total_current_balance` e `meta.balance_available`. O total agrega todas as contas do utilizador, ativas e encerradas; o filtro da interface não altera o total. Se algum lançamento realizado impedir um cálculo seguro, o saldo afetado e o total são `null` (indisponível), nunca zero presumido.

A Rota Financeira usa o mesmo serviço para obter o saldo efetivo de referência. A partir desse saldo, calcula separadamente a projeção: movimentos pendentes, incluindo vencidos, afetam o saldo projetado na data planeada, mas não o saldo atual de Contas nem o estado real da operação.
