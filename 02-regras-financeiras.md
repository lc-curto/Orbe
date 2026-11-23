# 02 — Regras financeiras

Estas invariantes são obrigatórias. Uma implementação que as viole está incorreta mesmo que a interface pareça funcionar.

## Fonte de verdade
- Existe um motor financeiro único.
- Lançamentos financeiros válidos são a fonte de verdade dos efeitos efetivos sobre contas, faturas e dívidas.
- Operação representa o acontecimento de negócio; lançamento representa um efeito financeiro num destino específico.
- Uma operação pode originar vários lançamentos, inclusive efeitos em destinos diferentes.
- Um efeito sobre uma fatura/dívida pode reconhecer uma obrigação sem representar uma saída de dinheiro de uma conta.
- Apenas lançamentos realizados com destino a conta alteram o saldo de caixa dessa conta.
- Saldos agregados podem ser armazenados como otimização se forem reconstruíveis.
- Rota Financeira é simulação sobre o motor central, não um segundo motor.

A separação operação/lançamentos (1:N) está aprovada. O destino de cada lançamento também está decidido: referência específica a uma conta, fatura ou dívida, com exatamente um destino por lançamento (ARC-001). O modelo conceptual e as relações entre entidades estão detalhados em [07 — Modelo ER](07-modelo-er.md); o esquema físico continua por validar.

## Realizado, pendente e projetado
- Pago/recebido é realizado; por pagar/receber é pendente.
- Data prevista não confirma pagamento ou recebimento.
- Pendentes e projeções não alteram saldos efetivos.
- Cancelamento preserva histórico e retira a operação da projeção.
- Apenas a Rota Financeira apresenta projeções.

## Receitas, despesas e cartões
- Compra e pagamento são eventos diferentes quando ocorrem em momentos distintos.
- Receita prevista só é realizada após confirmação explícita.
- Compra no cartão reconhece a despesa uma única vez, na data da compra, e aumenta a obrigação do cartão; não reduz imediatamente o saldo de uma conta bancária.
- Na compra parcelada, as alocações das parcelas são criadas na confirmação da compra e associadas aos respetivos períodos de faturação, mesmo que estejam em estado `PLANNED`.
- Cada alocação de compra produz no máximo um lançamento de obrigação dirigido à respetiva fatura/período. A abertura operacional da fatura não cria novos lançamentos.
- Os períodos `PLANNED` podem conter obrigações efetivas já reconhecidas; não são projeções nem faturas abertas na interface.
- A projeção de pagamentos futuros é separada dos lançamentos de obrigação. Só a confirmação do pagamento cria os efeitos efetivos na conta e na fatura.
- Pagamento da fatura é uma operação distinta: cria saída na conta e redução da obrigação da fatura; não cria uma segunda despesa.
- A redução da fatura é alocada explicitamente a um ou mais lançamentos de obrigação, sem exceder o saldo de cada obrigação.
- Reembolsos mantêm ligação à operação de origem e o respetivo destino é determinado pelos lançamentos ARC-001.


## Cartões, faturas e projeções

### Compra e reconhecimento da obrigação
- Uma compra com cartão reconhece a despesa uma única vez na confirmação da compra.
- Uma compra parcelada cria, na mesma confirmação, as alocações correspondentes aos períodos de faturação. Cada alocação gera no máximo um lançamento de obrigação, dirigido à fatura/período correspondente.
- Um período `PLANNED` é um período interno de faturação que já pode receber obrigações efetivas. A transição `PLANNED → OPEN` altera o ciclo operacional e a apresentação, mas não cria lançamentos adicionais.
- A obrigação do cartão e o saldo de caixa são grandezas diferentes: a compra aumenta a primeira, mas não reduz a conta bancária.

### Pagamento e alocação
- Um pagamento de fatura é uma operação própria com, no mínimo, dois efeitos quando liquidado a partir de uma conta: saída na conta e redução da obrigação na fatura.
- Cada lançamento tem um único destino ARC-001. O lançamento de saída aponta para a conta; o lançamento de redução aponta para a fatura.
- `payment_allocations` relaciona o lançamento de redução com os lançamentos de obrigação que liquida. A alocação não é lançamento e não altera saldos diretamente.
- A soma das alocações corresponde ao valor efetivamente liquidado; nenhuma obrigação pode receber alocações superiores ao seu saldo restante.
- Os dois efeitos do pagamento e as respetivas alocações são confirmados na mesma transação. Repetições devem ser idempotentes.

### Planos de pagamento e Rota Financeira
- Um plano de pagamento é uma intenção/projeção, não um lançamento efetivo.
- A projeção explícita reserva apenas a parcela da obrigação que lhe está associada. A liquidação residual automática cobre apenas o valor não reservado.
- Um plano não confirmado até à data prevista passa a vencido; deixa de ser uma saída futura na data passada, mas a obrigação permanece em aberto/vencida.
- Sem regra de débito automático ou novo reagendamento aprovado, o sistema não inventa uma nova data futura.
- Um pagamento confirmado substitui o valor correspondente da projeção por lançamentos efetivos, sem duplicação.
- O valor projetado para uma fatura nunca pode contar duas vezes a mesma parcela da obrigação.

### Ciclos de faturação
- Podem existir várias faturas de ciclos anteriores com obrigações pendentes.
- A regra de unicidade aplica-se à fatura cujo estado de ciclo é `OPEN`, não a todas as faturas com saldo em dívida.
- Abertura e fecho do ciclo não alteram por si só o valor da obrigação.

## Transferências e contas
- Transferência tem saída e entrada associadas.
- Valor e associação são coerentes; datas e estados podem ser independentes.
- Transferência não é receita nem despesa.

## Dívidas e pagamentos
- Dívida representa obrigação.
- Pagamentos parciais são registos individuais ligados à obrigação.
- Pagamentos podem partir de contas diferentes.
- Prestações são agenda/afetação de pagamentos, não uma segunda dívida.
- Reverter um pagamento parcial não reverte os restantes.

## Recorrências
- Programação e ocorrências são conceitos distintos.
- Cada ocorrência é individualizada e não pode ser duplicada.
- “Apenas esta ocorrência” altera só a selecionada.
- “Esta e todas as seguintes” altera a selecionada e futuras, atualizando a programação a partir dela.
- Ocorrências passadas/realizadas são preservadas; futuras pendentes podem ser atualizadas.
- Cancelar ocorrência não cancela a programação inteira.
- Rota Financeira recalcula após alterações válidas.

## Correções e conferência
- Operações com efeitos confirmados não são apagadas.
- Alterações financeiras relevantes exigem correção rastreável.
- A ação chama-se **Reverter**: preserva original e cria efeito contrário associado.
- Cancelamento preserva motivo e data.
- Logs técnicos não aparecem nas listas normais.
- Conferência compara saldo calculado com saldo real informado, regista diferença/data e não cria movimentos nem altera o saldo calculado.


## Classificação para estimativas da Rota

A classificação fixa/variável/excluída serve a estimativa de despesas variáveis na Rota Financeira; não altera a natureza económica da operação nem os seus efeitos nos saldos ou relatórios.

- A categoria fornece a classificação predefinida.
- Uma programação pode substituir o padrão da categoria.
- Uma ocorrência pode substituir a classificação da programação.
- A operação pode definir a classificação final.
- A precedência é: operação → ocorrência → programação → categoria → não classificada.
- A classificação resolvida deve ficar preservada na operação para que alterações posteriores à categoria/programação não reescrevam o histórico.
- `EXCLUDED` significa excluída da estimativa variável, não excluída dos movimentos, saldos ou relatórios.
- `UNCLASSIFIED` significa classificação desconhecida; não deve ser silenciosamente tratada como zero nem como despesa variável.
- Transferências, liquidações de fatura/dívida e efeitos técnicos não entram na estimativa variável por natureza.

A fórmula, janela histórica, distribuição diária e tratamento visual de estimativas incompletas continuam dependentes de decisão de produto.
## Precisão e invariantes de teste
Valores monetários exigem aritmética decimal exata; nunca usar float/double. Representação, escala e arredondamento ainda precisam de decisão técnica.

Testar sempre:
- pendentes não alteram saldo efetivo;
- canceladas não alteram saldo nem permanecem projetadas;
- pagamento de fatura não duplica despesa;
- pagamento de dívida reduz obrigação sem duplicá-la;
- transferência não altera património líquido;
- reversão compensa o efeito sem apagar origem;
- pagamentos parciais e saldo em aberto são coerentes;
- recorrências não duplicam ocorrências;
- saldos agregados correspondem aos lançamentos válidos.