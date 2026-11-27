# 01 — Produto e funcionalidades

> Documento consolidado. Cada tema tem aqui a sua fonte principal; não criar documentos separados para páginas, casos ou etapas individuais.

---

## Objetivo
Aplicação de gestão financeira pessoal para compreender e gerir contas, movimentos, cartões de crédito, dívidas, recorrências, relatórios e projeções. O produto combina rigor financeiro com uma experiência simples; a interface não deve expor complexidade técnica desnecessária.

## Utilizador e âmbito
**Aprovado**
- Utilização individual; um utilizador pode gerir várias contas.
- Contas bancárias, dinheiro físico e carteiras digitais.
- Receitas e despesas realizadas ou pendentes.
- Transferências, cartões, faturas, dívidas, prestações, pagamentos parciais e recorrências.
- Relatórios de operações realizadas.
- Rota Financeira para projeções futuras.

**Fora do âmbito atual**
- Multiutilizador/família.
- Multi-moeda e conversão cambial.
- Orçamentos e metas de poupança.
- Projeções exclusivamente na Rota Financeira. Dashboard, Movimentos, Contas, Cartões e Relatórios não apresentam projeções como valores realizados.

## Moeda
O utilizador escolhe uma moeda principal. A aplicação opera apenas nessa moeda.

## Plataformas, stack e organização aprovadas
- **Backend:** Laravel 13 + PHP.
- **Base de dados:** MySQL 8.4 LTS.
- **Web:** React + TypeScript + Vite.
- **Mobile:** React Native + Expo + TypeScript, para Android e iOS.
- **Comunicação:** API REST com JSON, comum aos clientes Web e mobile.
- **Repositório:** monorepo único para Backend, Web, Mobile e documentação.

Estrutura lógica de referência:
```text
Orbe/
├── backend/
├── web/
├── mobile/
├── docs/
├── AGENTS.md
└── README.md
```

Cada aplicação mantém as suas próprias dependências, configuração e processo de execução. Não foi aprovada a adoção de ferramentas adicionais de orquestração de monorepo nesta fase.

Os clientes Web e mobile terão interfaces próprias, mas utilizarão o mesmo backend. Tipos, validações e módulos partilháveis podem ser reutilizados quando tecnicamente adequado; não se exige partilha de todos os componentes visuais.

## Outras decisões técnicas pendentes
- Autenticação e gestão de sessões.
- Alojamento, distribuição e infraestrutura.
- Ferramentas finais de testes e CI/CD.

## Princípios
1. Motor financeiro único.
2. Não duplicar efeitos financeiros.
3. Preservar origem e histórico das correções.
4. Separar realizado de previsto.
5. Manter regras de domínio consistentes entre plataformas.
6. Não apresentar ações indisponíveis.
7. Preferir arquitetura simples e modular; complexidade adicional exige justificação.

## Critério de sucesso
Os saldos e resultados devem ser coerentes em todas as páginas e plataformas, sem duplicação de efeitos financeiros.

---

## Estados
O sistema controla os estados e transições conforme a natureza e os factos confirmados.
- **Realizado:** pagamento/recebimento confirmado; antes de guardar, exige a associação ao destino/instrumento financeiro adequado ao fluxo.
- **Pendente:** gasto ou ganho esperado ainda não efetivado; não exige nem apresenta conta, cartão ou outro meio de liquidação. A associação financeira é recolhida apenas ao confirmar como realizado.
- **Cancelado:** preservado no histórico e excluído da projeção.
- **Parcial:** indicador de apresentação de obrigação parcialmente liquidada; na lista mostrar apenas “Parcial”, sem valores detalhados.

Estados específicos de faturas, obrigações, cartões e ocorrências serão detalhados nos fluxos/detalhes associados e no domínio.

## Requisitos funcionais
| ID | Requisito | Estado |
|---|---|---|
| OP-001 | Estado inicial deriva dos dados e da natureza do evento | Aprovado |
| OP-002 | Data prevista não confirma operação | Aprovado |
| OP-003 | Edição respeita estado, natureza e dependências | Aprovado |
| OP-004 | Alterações relevantes em operações realizadas são rastreáveis | Aprovado |
| OP-005 | Pagamento/recebimento pendente exige confirmação explícita | Aprovado |
| OP-006 | Pagamentos parciais são individuais e ligados à obrigação | Aprovado |
| OP-007 | Pagamentos podem partir de contas diferentes | Aprovado |
| OP-008 | Eliminação só sem efeitos confirmados e sem dependências impeditivas | Aprovado |
| OP-009 | Cancelamento preserva histórico, motivo e data | Aprovado |
| OP-010 | Reversão preserva original e cria efeito contrário associado | Aprovado |
| OP-011 | Transferência mantém saída e entrada associadas | Aprovado |
| OP-012 | Recorrência pode alterar apenas a ocorrência selecionada | Aprovado |
| OP-013 | Recorrência pode alterar selecionada e seguintes | Aprovado |
| OP-014 | Ocorrências recorrentes não podem duplicar | Aprovado |
| OP-015 | Dependências e operações relacionadas são protegidas | Aprovado |
| OP-016 | Projeções recalculam após alterações relevantes | Aprovado |
| OP-017 | Saldo inicial de conta é reconhecido uma única vez por operação própria, sem natureza de receita/despesa, e integra o saldo efetivo por lançamento realizado | Aprovado |
| OP-018 | Gasto/ganho pendente não apresenta nem exige destino financeiro; ao guardar como realizado, exige destino/instrumento adequado antes de persistir | Aprovado |

## Ações
- **Criar:** estado inicial decorre dos dados; não permitir estado incoerente.
- **Editar:** campos disponíveis dependem de estado e natureza; efeitos confirmados exigem correção rastreável.
- **Confirmar:** ação explícita; cria efeitos válidos uma única vez.
- **Pagamento parcial:** cada pagamento é individual, ligado à obrigação e à conta de origem.
- **Eliminar:** apenas sem efeitos confirmados e sem dependências que exijam preservação.
- **Cancelar:** preserva operação, motivo e data; não altera saldo efetivo e retira da projeção.
- **Reverter:** preserva original e cria efeito contrário associado; não é eliminação destrutiva.
- **Transferir:** duas partes associadas, valor coerente e datas/estados independentes.
- **Recorrência:** “Apenas esta ocorrência” altera só a selecionada; “Esta e todas as seguintes” altera selecionada e futuras e atualiza programação a partir dela. Passado e realizadas permanecem preservados.

## Critérios de aceitação
Uma operação só está correta se:
1. o estado corresponde aos factos confirmados;
2. efeitos financeiros são criados uma única vez;
3. saldo efetivo muda apenas por efeitos realizados válidos;
4. operação e lançamentos mantêm associação;
5. correções, cancelamentos e reversões preservam rastreabilidade;
6. páginas que mostram a mesma informação são coerentes;
7. Rota Financeira recalcula quando necessário;
8. testes cobrem sucesso, falha, repetição, concorrência e dependências.

## Subpáginas e modais
Abordagem aprovada: subpáginas para consulta/exploração; modais para ações pontuais, formulários e confirmações.
- Contas: detalhes em subpágina; adicionar/editar em modal; conferência em subpágina.
- Cartões: detalhes e faturas em subpágina; adicionar/editar em modal.
- Obrigações: consulta e ações no detalhe do movimento/fatura associado; não existe página autónoma de Dívidas. Financiamentos e obrigações preexistentes requerem fluxo específico ainda por definir.
A especificação detalhada será feita depois das páginas principais.

## Regras operacionais de cartões e faturas

### Compra parcelada
- A confirmação da compra reconhece a despesa uma única vez.
- Na mesma transação, cria as alocações de compra para os períodos correspondentes e os lançamentos de obrigação associados.
- Períodos futuros podem estar em `PLANNED`; a obrigação já existe, embora a fatura ainda não esteja aberta na interface.
- Abrir um período não volta a criar lançamentos.
- A confirmação deve ser idempotente: repetir o pedido não pode duplicar despesa, alocações ou obrigações.

### Saldo inicial do cartão
- Saldo inicial zero não exige distribuição.
- Saldo inicial positivo exige uma operação própria e distribuição integral por faturas/ciclos; o total distribuído tem de coincidir exatamente com o saldo informado.
- Cada distribuição reconhece obrigação na fatura indicada. Não é compra, despesa, receita nem saída de conta.
- Um cartão pode ter zero ou uma operação original de saldo inicial. Distribuições iniciais são preservadas; correções posteriores são operações associadas e não uma nova abertura.
- Redistribuição só pode atingir a parcela ainda não liquidada. Não se altera silenciosamente o destino de lançamentos confirmados.

### Pagamento de fatura
- Um pagamento pode abranger várias faturas, mantendo uma única operação na interface.
- O pagamento cria uma saída total na conta e uma redução por cada fatura abrangida.
- Cada redução é alocada a obrigações específicas da mesma fatura.
- Pagamentos parciais são permitidos; a soma das reduções tem de coincidir com a saída total.
- A operação, a saída, todas as reduções e as alocações são atómicas: ou são confirmadas em conjunto ou nenhuma é confirmada.
- Reversões mantêm ligação às alocações originais através de rastreabilidade própria; não reutilizam `payment_allocations`.

### Pagamentos planeados
- Um plano de pagamento não é um lançamento efetivo e não altera saldos.
- O valor reservado por planos explícitos não pode ser novamente incluído na liquidação residual automática.
- Um plano não confirmado na data prevista passa a vencido; a obrigação permanece em aberto.
- Sem política aprovada de débito/reagendamento automático, não criar uma nova data futura por inferência.

### Ciclo de faturação
- O estado do ciclo (`PLANNED`, `OPEN`, `CLOSED`) é distinto do valor em dívida e do estado de pagamento.
- Podem existir vários ciclos anteriores com dívida pendente.
- No máximo um ciclo por cartão pode estar `OPEN`; a integridade deve ser protegida no banco de dados e no fluxo transacional.

## Saldo inicial de conta

- Na criação da conta, informar o saldo existente no início da utilização da conta no Orbe.
- O saldo inicial é reconhecido como `ACCOUNT_OPENING_BALANCE`, com efeito realizado dirigido à conta; não é receita, despesa, transferência ou conferência.
- Saldo inicial positivo aumenta a conta; saldo inicial negativo, quando permitido pelo tipo de conta, reduz a conta; zero não cria lançamento.
- A data efetiva é a data de início de utilização da conta no Orbe. O saldo inicial é uma posição de abertura, não uma importação automática de movimentos anteriores.
- Existe no máximo uma operação original por conta. A criação é atómica e idempotente.
- O saldo inicial não pode ser alterado diretamente na edição da conta. Correções posteriores preservam a abertura original e são rastreáveis.
- O saldo atual é derivado da abertura e dos restantes lançamentos realizados válidos da conta.

## Critérios específicos de aceitação de cartões

1. Uma compra parcelada de 1.200 € em quatro parcelas reconhece 1.200 € de despesa, não 4.800 €.
2. As quatro obrigações de 300 € são reconhecidas na confirmação, mesmo que os períodos estejam `PLANNED`.
3. Abrir um período não cria novos lançamentos.
4. A compra não altera o saldo da conta bancária.
5. O pagamento de 300 € cria uma saída de 300 € na conta e uma redução de 300 € na fatura, sem nova despesa.
6. A alocação de um pagamento parcial não pode exceder o saldo da obrigação liquidada.
7. Um plano vencido continua representado como obrigação vencida, mas não como saída futura numa data passada.
8. Planos explícitos e liquidação residual não podem projetar duas vezes a mesma parcela.
9. A abertura concorrente de ciclos não pode criar duas faturas `OPEN` para o mesmo cartão.
10. Um saldo inicial positivo é distribuído integralmente por faturas, sem parcela não atribuída.
11. Redistribuições não alteram a exposição total e não podem consumir valores já liquidados.
12. Um pagamento que abrange várias faturas gera uma saída total e reduções por fatura, numa única transação.
13. Reversões parciais e totais de pagamentos identificam as alocações originais e respeitam o limite ainda não revertido.
14. Criação do saldo inicial, redistribuições e reversões são idempotentes; repetição não duplica efeitos.
