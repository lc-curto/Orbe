# 03 — Funcionalidades e operações

## Estados
O sistema controla os estados e transições conforme a natureza e os factos confirmados.
- **Realizado:** pagamento/recebimento confirmado.
- **Pendente:** obrigação ou recebimento esperado ainda não confirmado.
- **Cancelado:** preservado no histórico e excluído da projeção.
- **Parcial:** indicador de apresentação de obrigação parcialmente liquidada; na lista mostrar apenas “Parcial”, sem valores detalhados.

Estados específicos de faturas, dívidas, cartões e ocorrências serão detalhados nas respetivas subpáginas e no domínio.

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
- Dívidas: detalhes em subpágina; adicionar/editar em modal.
A especificação detalhada será feita depois das páginas principais.

## Regras operacionais de cartões e faturas

### Compra parcelada
- A confirmação da compra reconhece a despesa uma única vez.
- Na mesma transação, cria as alocações de compra para os períodos correspondentes e os lançamentos de obrigação associados.
- Períodos futuros podem estar em `PLANNED`; a obrigação já existe, embora a fatura ainda não esteja aberta na interface.
- Abrir um período não volta a criar lançamentos.
- A confirmação deve ser idempotente: repetir o pedido não pode duplicar despesa, alocações ou obrigações.

### Pagamento de fatura
- O pagamento confirmado cria o efeito de saída na conta e o efeito de redução na fatura.
- A redução é alocada a uma ou várias obrigações específicas da fatura.
- Pagamentos parciais são permitidos; apenas o valor efetivamente pago é alocado.
- A soma das alocações tem de coincidir com o valor do efeito de redução da fatura.
- O pagamento e todos os seus efeitos/alocações são atómicos: ou são confirmados em conjunto ou nenhum é confirmado.

### Pagamentos planeados
- Um plano de pagamento não é um lançamento efetivo e não altera saldos.
- O valor reservado por planos explícitos não pode ser novamente incluído na liquidação residual automática.
- Um plano não confirmado na data prevista passa a vencido; a obrigação permanece em aberto.
- Sem política aprovada de débito/reagendamento automático, não criar uma nova data futura por inferência.

### Ciclo de faturação
- O estado do ciclo (`PLANNED`, `OPEN`, `CLOSED`) é distinto do valor em dívida e do estado de pagamento.
- Podem existir vários ciclos anteriores com dívida pendente.
- No máximo um ciclo por cartão pode estar `OPEN`; a integridade deve ser protegida no banco de dados e no fluxo transacional.

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
