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

A separação operação/lançamentos (1:N) está aprovada. O destino de cada lançamento também está decidido: referência específica a uma conta, fatura ou dívida, com exatamente um destino por lançamento (ARC-001). O modelo conceptual e as relações entre entidades estão detalhados em [07 — Modelo ER](04-arquitetura-modelo-e-auditoria.md); o esquema físico continua por validar.

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
- A redução de cada fatura é alocada explicitamente a um ou mais lançamentos de obrigação dessa mesma fatura, sem exceder o saldo de cada obrigação.
- Um único pagamento pode abranger várias faturas: uma saída total na conta e uma redução por fatura; todos os efeitos e alocações são atómicos.
- Reembolsos mantêm ligação à operação de origem e o respetivo destino é determinado pelos lançamentos ARC-001.

### Saldo inicial de cartões
- O saldo já utilizado antes da entrada no Orbe é registado por uma operação própria, sem natureza de receita/despesa e sem saída de conta.
- Saldo inicial zero não exige distribuição; saldo inicial positivo exige distribuição integral por faturas/ciclos, com soma exatamente igual ao valor informado.
- Cada efeito de reconhecimento aponta diretamente para uma fatura (`invoice_id`); não existe parcela por distribuir nem novo destino financeiro.
- A operação original é única por cartão. Distribuições iniciais são históricas e imutáveis; redistribuições posteriores são operações corretivas com efeitos de redução na fatura de origem e aumento na fatura de destino.
- Distribuição histórica, correções e obrigação em aberto são grandezas distintas. A obrigação em aberto é sempre derivada dos lançamentos financeiros válidos; as estruturas de distribuição apenas preservam proveniência e rastreabilidade.
- Só pode ser redistribuída a obrigação ainda não liquidada e não comprometida por correções anteriores.


## Cartões, faturas e projeções

### Compra e reconhecimento da obrigação
- Uma compra com cartão reconhece a despesa uma única vez na confirmação da compra.
- Uma compra parcelada cria, na mesma confirmação, as alocações correspondentes aos períodos de faturação. Cada alocação gera no máximo um lançamento de obrigação, dirigido à fatura/período correspondente.
- Um período `PLANNED` é um período interno de faturação que já pode receber obrigações efetivas. A transição `PLANNED → OPEN` altera o ciclo operacional e a apresentação, mas não cria lançamentos adicionais.
- A obrigação do cartão e o saldo de caixa são grandezas diferentes: a compra aumenta a primeira, mas não reduz a conta bancária.

### Pagamento e alocação
- Um pagamento pode abranger uma ou várias faturas. Quando parte de uma conta, gera uma saída total na conta e uma redução por cada fatura abrangida.
- Cada lançamento tem um único destino ARC-001. A saída aponta para a conta; cada redução aponta para a respetiva fatura.
- `payment_allocations` relaciona cada redução com lançamentos de obrigação da mesma fatura. A regra de mesma fatura aplica-se a cada par de alocação, não à operação inteira.
- A soma das reduções por fatura corresponde à saída total; as alocações correspondem a cada redução e não podem exceder o saldo restante das obrigações.
- A saída, todas as reduções e todas as alocações são confirmadas na mesma transação. Repetições devem ser idempotentes.
- Reversões de pagamento usam rastreabilidade própria ligada às alocações originais; `payment_allocations` não é reutilizada para representar reversões.

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

### Saldo inicial de conta
- Ao criar uma conta no Orbe, o utilizador informa o saldo que essa conta já tinha no início da sua utilização no Orbe. O saldo inicial é uma posição de abertura, não uma receita ou despesa.
- O saldo inicial é reconhecido por uma operação própria, de natureza `ACCOUNT_OPENING_BALANCE`, com um lançamento realizado dirigido à conta. A operação não participa na DRE nem nos KPIs de receitas/despesas.
- A data efetiva da abertura corresponde à data de início de utilização da conta no Orbe. O saldo informado funciona como posição de partida; movimentos históricos anteriores não são importados nem somados automaticamente.
- Valor positivo gera efeito `INCREASE`; valor negativo, quando permitido pelo tipo de conta, gera efeito `DECREASE`. O valor do lançamento permanece positivo e o efeito define a direção. Saldo inicial zero não gera lançamento nem operação de abertura.
- Existe no máximo uma operação original de saldo inicial por conta. O saldo da conta é sempre reconstruído a partir dos lançamentos realizados válidos, incluindo o lançamento de abertura e os movimentos posteriores.
- O saldo inicial não é um campo de saldo editável depois da criação. Qualquer correção posterior deve ser rastreável, preservar a abertura original e criar efeitos corretivos; não pode sobrescrever ou apagar o lançamento original.
- A criação da conta, a operação de abertura e o lançamento correspondente devem ser atómicos e idempotentes: repetição não pode duplicar o saldo inicial.

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
Valores monetários exigem aritmética decimal exata; o núcleo financeiro persiste `DECIMAL(19,4)` e nunca usa `float/double`. Valores com mais de quatro casas são rejeitados. Somatórios e alocações não fazem arredondamento intermédio; divisões distribuem o resto em unidades de `0,0001` por ordem determinística para preservar a soma. A apresentação a duas casas usa arredondamento half-up e não altera o valor persistido. Esta decisão é o ARC-003 aprovado para o núcleo financeiro.

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
