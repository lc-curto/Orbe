# 09 — Auditoria do backend e do núcleo financeiro

> Auditoria realizada em 2026-11-24 após o fecho do modelo físico do núcleo financeiro.

## Veredicto

O núcleo financeiro implementado está coberto por migrations, modelos, serviços, controllers, constraints e testes para os fluxos de cartões/faturas já suportados, operações base da Fase 1 e transferências de duas pernas da Fase 2. A validação é concluída para este perímetro.

O ER conceptual também descreve módulos que ainda não existem fisicamente no backend. A Fase 3 de recorrências passou a ter contrato mínimo e implementação própria. A gestão completa de dívidas continua fora do perímetro implementado.

## Matriz de cobertura do núcleo implementado

| Conceito/fluxo | Migration/tabela | Serviço/API | Validação/testes | Estado |
|---|---|---|---|---|
| Contas financeiras como destinos | `financial_accounts` | usado pelos serviços financeiros | isolamento e invariantes dos serviços | Implementado no núcleo |
| Cartões | `cards` | leitura autenticada | autorização e leitura | Implementado |
| Ciclos/faturas | `card_invoices` | leitura autenticada | unicidade de `OPEN`, estado e período | Implementado |
| Operações | `operations` | controller financeiro | idempotência e associação | Implementado |
| Lançamentos | `financial_entries` | serviços financeiros | destino único, efeito, estado e valores positivos | Implementado |
| Compras parceladas | `purchase_allocations` | `POST /api/purchases` | soma das alocações, atomicidade e repetição | Implementado |
| Saldo inicial | `card_opening_balances` e `opening_balance_distributions` | `POST /api/cards/{card}/opening-balance` | distribuição integral, unicidade e atomicidade | Implementado |
| Correções do saldo inicial | `opening_balance_adjustments` | serviço financeiro correspondente | rastreabilidade e limites acumulados | Estrutura implementada; endpoint de correção ainda não exposto |
| Pagamentos | `payment_allocations` | `POST /api/operations/{payment}/payment-allocations` | mesma fatura, limites e atomicidade | Implementado |
| Reversões | `payment_reversal_allocations` | `POST /api/payment-allocations/{allocation}/reversals` | reversão parcial/total e rastreabilidade | Implementado |
| Transferências | `transfer_legs` | `POST /api/transfers` e confirmação de perna | duas pernas, contas do mesmo utilizador e efeitos direcionais | Implementado |
| Recorrências | `recurrence_schedules` e `recurrence_occurrences` | endpoints de programação, geração, materialização, alteração e cancelamento | idempotência, isolamento, preservação de realizadas e ausência de lançamentos pendentes | Implementado na Fase 3 |

## Constraints verificadas no esquema físico

As migrations aplicadas ao núcleo incluem:

- `DECIMAL(19,4)` nos valores monetários;
- valores positivos para operações, lançamentos e alocações;
- exatamente um destino em cada `financial_entry`;
- efeitos e estados limitados aos valores aprovados;
- período de fatura válido;
- dias de fecho e vencimento dentro do intervalo permitido;
- no máximo uma fatura `OPEN` por cartão;
- unicidade de cartão/período;
- índices para as relações e consultas financeiras;
- FKs e políticas restritivas para preservar histórico.

As regras que abrangem várias linhas continuam nos serviços transacionais: soma das alocações, saldo ainda disponível, limites acumulados, coerência entre utilizador/fatura/operação e concorrência.

## Fluxos conceptuais ainda sem cobertura física suficiente

| Fluxo | O que existe | O que falta antes de implementar |
|---|---|---|
| Despesa comum | contrato mínimo e endpoint de criação Fase 1 | edição, eliminação, cancelamento e regras contextuais ainda não implementados |
| Receita | contrato mínimo e endpoint de criação/confirmação Fase 1 | edição, eliminação, cancelamento e regras contextuais ainda não implementados |
| Transferência | contrato mínimo, `transfer_legs`, endpoints de criação/confirmação e testes Fase 2 | cancelamento explícito de perna e regras contextuais de edição ainda não implementados |
| Recorrência | contrato mínimo, tabelas e API da Fase 3 | gestão de calendário complexo e regras de produto adicionais permanecem fora do âmbito |
| Gestão completa de dívidas | `debts` e lançamentos básicos | detalhe de prestações, pagamentos, estados, dependências, endpoints e regras de associação |
| Correção/redistribuição do saldo inicial | tabela e relações de rastreabilidade | endpoint público, payload aprovado e testes de API |

## Decisão de controlo

A partir desta auditoria:

1. A validação do modelo físico contra o núcleo financeiro implementado está concluída.
2. Os fluxos sem contrato suficiente permanecem bloqueados e não devem receber payloads ou campos inventados.
3. O próximo trabalho backend deve começar por fechar os contratos funcionais ausentes, ou por implementar apenas os endpoints já especificados e testados.
4. O frontend não deve expor ações para os fluxos bloqueados.

Esta auditoria não altera o ER conceptual, não transforma os módulos ausentes em implementados e não cria migrations especulativas.
