# 02 — Regras financeiras

Estas invariantes são obrigatórias. Uma implementação que as viole está incorreta mesmo que a interface pareça funcionar.

## Fonte de verdade
- Existe um motor financeiro único.
- Lançamentos financeiros válidos são a fonte de verdade dos saldos efetivos.
- Operação representa o acontecimento de negócio; lançamento representa um efeito financeiro.
- Uma operação pode originar vários lançamentos.
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
- Compra no cartão reconhece a despesa na origem.
- Pagamento da fatura liquida a obrigação; não cria uma segunda despesa.
- Parcelamento não duplica o valor da compra: o total é reconhecido uma vez e o impacto mensal é apresentado separadamente.
- Reembolsos mantêm ligação à operação de origem.

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