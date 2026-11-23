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