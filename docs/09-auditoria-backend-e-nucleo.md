# 09 — Auditoria do backend e do núcleo financeiro

> Auditoria realizada em 2026-11-24 após o fecho do modelo físico do núcleo financeiro.

## Veredicto

O núcleo financeiro implementado está coberto por migrations, modelos, serviços, controllers, constraints e testes para os fluxos de cartões/faturas já suportados. A validação é concluída para este perímetro.

O ER conceptual também descreve módulos que ainda não existem fisicamente no backend. Despesas comuns, receitas, transferências completas, recorrências e gestão completa de dívidas não podem ser marcadas como implementadas porque ainda faltam contratos de campos, estados, permissões, dependências e endpoints. Criá-los agora exigiria inventar comportamento fora dos documentos aprovados.

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
| Despesa comum | conceito no ER e na documentação | contrato de campos, categoria, conta, estado, endpoint e regras de edição/cancelamento |
| Receita | conceito no ER e na documentação | contrato de campos, categoria, conta, confirmação, endpoint e permissões |
| Transferência | relação conceptual de duas pernas | tabelas/constraints das pernas, estados independentes, liquidação parcial, endpoints e testes |
| Recorrência | conceito no ER e regras de ocorrência | tabelas de programação/ocorrência, materialização idempotente, edição “esta e seguintes” e endpoints |
| Gestão completa de dívidas | `debts` e lançamentos básicos | detalhe de prestações, pagamentos, estados, dependências, endpoints e regras de associação |
| Correção/redistribuição do saldo inicial | tabela e relações de rastreabilidade | endpoint público, payload aprovado e testes de API |

## Decisão de controlo

A partir desta auditoria:

1. A validação do modelo físico contra o núcleo financeiro implementado está concluída.
2. Os fluxos sem contrato suficiente permanecem bloqueados e não devem receber payloads ou campos inventados.
3. O próximo trabalho backend deve começar por fechar os contratos funcionais ausentes, ou por implementar apenas os endpoints já especificados e testados.
4. O frontend não deve expor ações para os fluxos bloqueados.

Esta auditoria não altera o ER conceptual, não transforma os módulos ausentes em implementados e não cria migrations especulativas.
