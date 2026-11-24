# Orbe — Especificação final do sistema de formulários e interações

**Stack:** React, TypeScript, Vite e Tamagui  
**Data:** 24/11/2026  
**Âmbito:** produto, UX e arquitetura frontend.

## 1. Âmbito e princípios

Esta especificação consolida o sistema reutilizável de formulários, modais, bottom sheets, validações e feedbacks do Orbe.

- O Dashboard está aprovado e não deve ser redesenhado.
- Preservar a paleta, os tokens e o Design System existentes.
- Usar uma única lógica de formulário partilhada; apenas o recipiente visual varia com o viewport.
- Nesta etapa, não alterar backend, regras financeiras, endpoints ou base de dados.
- Não criar migrations nem inventar endpoints ou regras financeiras.
- Não simular persistência nem apresentar uma operação como concluída antes da confirmação do servidor.
- A API de compra com cartão não pode ser reutilizada como endpoint de despesa comum: cria uma operação PURCHASE e obrigações em faturas.

## 2. Arquitetura geral

Separar em quatro camadas:

1. **Formulários de domínio:** despesa, receita, transferência, conta, cartão, saldo inicial e pagamento.
2. **Sistema comum:** layout, campos, validação, estado e ações.
3. **Recipiente responsivo:** modal, bottom sheet ou ecrã completo.
4. **Aplicação:** normalização, API, atualização de dados e feedback.

Separação de responsabilidades:
- UI renderiza; não calcula efeitos financeiros.
- Estado controla valores, dirty/touched e submissão; não chama backend.
- Validação cobre formato e regras locais; não duplica o motor financeiro.
- Normalização converte dinheiro e datas.
- Serviços API comunicam com endpoints reais.
- Mapeador de erros normaliza respostas HTTP/Laravel.
- Cache/dados atualiza apenas informação afetada.
- Feedback apresenta mensagens; não decide estados financeiros.

## 3. Recipientes responsivos

| Viewport | Breakpoint | Recipiente |
|---|---:|---|
| Mobile | até 767 px | Bottom sheet |
| Tablet | 768–1023 px | Modal central adaptável |
| Desktop | >= 1024 px | Modal central |

**Desktop**
- Largura padrão 520 px; máximo 560 px.
- Altura máxima 85vh.
- Header e footer fixos; scroll apenas no conteúdo.
- Formulários especializados podem atingir 680 px.

**Tablet**
- Largura `min(560px, calc(100vw - 48px))`.
- Altura máxima 90vh.
- Header e ações fixos; conteúdo rolável.

**Mobile**
- Bottom sheet a 100% da largura e máximo 92dvh.
- Cantos superiores arredondados; header/footer fixos.
- Scroll interno e respeito pelas safe areas.
- O teclado não pode encobrir o campo ativo nem as ações.
- Usar full screen em formulários extensos, incluindo saldo inicial.

**Fecho e proteção de alterações**
- X/Cancelar solicitam fecho.
- Esc fecha em desktop/tablet quando permitido.
- Clique fora só fecha sem alterações.
- Arrastar o sheet não fecha quando há alterações.
- Durante submissão, bloquear fecho.
- Erro da API mantém o formulário aberto e os valores.
- Com alterações por guardar, apresentar: “Tem alterações por guardar. Pretende sair sem guardar?” com “Continuar a editar” e “Sair sem guardar”.

## 4. Formulário-base

Estrutura obrigatória:
- Header com título, descrição opcional e fecho.
- Conteúdo com campos e secções, scroll independente.
- Erros junto dos campos e resumo global quando necessário.
- Footer fixo com Cancelar e ação principal.
- Bloquear submissões duplicadas e mostrar loading no botão.
- Só fechar e mostrar Toast de sucesso após confirmação da API.
- Em erro, preservar os dados e permitir correção/repetição.

## 5. Formulários de movimentos

### Despesa
Campos obrigatórios, nesta ordem:
1. Descrição — vazia por defeito; trim; rejeitar só espaços; limite recomendado 191 caracteres, condicionado ao contrato API.
2. Valor — positivo e maior que zero.
3. Categoria — selecionar categoria existente; não criar categoria dentro do formulário.
4. Conta — conta ativa; pré-selecionar apenas se houver uma única opção adequada.
5. Data — hoje por defeito; aceitar passado e futuro.

A data não significa que a operação já foi realizada. Não incluir anexos nesta fase sem contrato API identificado.

Payload apenas conceptual, não confirmado:
```json
{"description":"Supermercado","amount":"45.90","category_id":3,"account_id":1,"effective_at":"2026-11-24"}
```
Após confirmação: atualizar Movimentos e dados afetados, fechar e apresentar “Despesa guardada com sucesso.”

### Receita
Reutiliza a estrutura da despesa, com título próprio, categorias de receita e conta de destino. O valor é positivo e representa uma entrada. Receita pendente não aumenta o saldo efetivo antes da confirmação.

Payload conceptual, não confirmado:
```json
{"description":"Salário","amount":"1500.00","category_id":5,"account_id":1,"effective_at":"2026-11-24"}
```
Sucesso: “Receita guardada com sucesso.”

### Transferência
- Origem, destino, valor e data obrigatórios; descrição opcional.
- Contas diferentes, ativas e pertencentes ao utilizador.
- Valor positivo e na moeda principal.
- Não inventar bloqueio por saldo insuficiente sem regra no backend.
- Sem contas: EmptyState; com apenas uma conta, impedir submissão.
- Transferência gera saída e entrada associadas; não é receita nem despesa.
- Estados/datas das duas partes podem ser independentes conforme o modelo aprovado.
- Erro para contas iguais: “Não podes transferir dinheiro para a mesma conta de origem.”

## 6. Contas

- Consulta em subpágina; criar/editar em modal ou sheet; saldos numa subpágina própria.
- Modelo consultado: `FinancialAccount` com `name`, `account_type` e `status`.
- Nome e tipo obrigatórios.
- Tipos de produto previstos: conta bancária, dinheiro físico e carteira digital; confirmar enum técnico antes de implementar.
- Usar a moeda principal do Orbe; não introduzir seletor multi-moeda nesta fase.
- Não incluir saldo inicial: não existe esse campo no modelo consultado.
- Estado é gerido pelo backend.
- Não criar saldo inicial como despesa/receita fictícia.

## 7. Cartões e faturas

### Cartões
Decisão de UX recomendada para criar/editar:
- Nome, limite de crédito, dia de fecho e dia de vencimento obrigatórios.
- Limite maior que zero; dias válidos de 1 a 31.
- Não mostrar banco nem últimos dígitos se não existirem no modelo.
- Não alterar parâmetros retroativamente se afetarem ciclos/obrigações sem validação do servidor.
- API de escrita não identificada: não inventar integração.

### Faturas
Apresentar separadamente:
- período;
- vencimento;
- valor da obrigação;
- valor pago;
- valor em aberto;
- estado do ciclo: `PLANNED`, `OPEN`, `CLOSED`;
- estado de liquidação.

Faturas antigas ainda em dívida continuam visíveis. `PLANNED` pode conter obrigações efetivas. Consultar/abrir uma fatura não cria lançamentos.

### Saldo inicial de cartão
- Operação própria; não é receita, despesa nem saída de conta.
- Saldo declarado positivo e integralmente distribuído por faturas.
- Soma das distribuições tem de ser exatamente igual ao declarado.
- Cada distribuição deve apontar para fatura do mesmo cartão.
- Uma operação original por cartão; histórico de distribuições imutável; correções rastreáveis.
- Zero não requer operação.
- Usar full screen em mobile.

Payload conhecido do backend:
```json
{"declared_amount":"500.00","distributions":[{"invoice_id":1,"amount":"300.00"},{"invoice_id":2,"amount":"200.00"}]}
```
Validar cartão, valor positivo, faturas do cartão, distribuições positivas, faturas distintas, soma exata e inexistência de saldo inicial anterior. O backend mantém a validação final.

### Pagamento de fatura
- Conta de origem, faturas, valor total, distribuição por fatura e alocação por obrigação.
- Suportar pagamentos parciais e multi-fatura.
- Uma operação de pagamento, uma saída total da conta e reduções alocadas às obrigações; não criar despesa duplicada.
- O endpoint atual de alocação associa um pagamento já existente às obrigações; não cria o pagamento.
- Reversão é operação separada e rastreável, com confirmação contextual; não editar/apagar o pagamento original.
- Em erro, manter formulário e valores.

## 8. Componentes e contratos

| Componente | Responsabilidade / props essenciais |
|---|---|
| `FormModal` | Modal desktop/tablet: `open`, `title`, `onClose`, `maxWidth` |
| `FormSheet` | Bottom sheet mobile: `open`, `title`, `onClose`, `maxHeight` |
| `FullScreenForm` | Formulário extenso: `open`, `title`, `onClose` |
| `ResponsiveFormContainer` | Escolhe recipiente conforme viewport |
| `FormLayout` | `children`, `onSubmit`, `isSubmitting` |
| `FormField` | `name`, `label`, `error`, `required` |
| `TextInput` | `value`, `onChange`, `maxLength` |
| `MoneyInput` | `value`, `currency`, `precision`, `onChange` |
| `DateInput` | `value`, `onChange`, `min`, `max` |
| `AccountSelect` | `accounts`, `value`, `disabledIds` |
| `CategorySelect` | `categories`, `type`, `value` |
| `CardSelect` | `cards`, `value` |
| `InvoiceSelect` | `invoices`, `value`, `multiple` |
| `Textarea` | `value`, `onChange`, `maxLength` |
| `FormActions` | `onCancel`, `onSubmit`, `loading` |
| `ConfirmDialog` | `open`, `title`, `description`, `onConfirm` |
| `Toast` | `type`, `message`, `duration` |
| `LoadingState` | `label`, `size` |
| `ErrorState` | `message`, `onRetry` |
| `EmptyState` | `title`, `description`, `action` |
| `FormErrorSummary` | Resumo de erros gerais |

Componentes genéricos não conhecem serviços de domínio nem regras financeiras. Toast não atualiza listas; FormModal não conhece regras financeiras.

## 9. Dinheiro e datas

### Dinheiro
Aceitar formatos inequívocos:
- `100`, `100,50`, `100.50`;
- `1.000,50`, `1,000.50`;
- `€100,50` e `€ 100,50`.

`1.234` é ambíguo e deve ser rejeitado. Remover símbolo e espaços sem perder a parte decimal. Durante edição, evitar reformatação agressiva e salto do cursor; formatar localmente após blur.

- Zero inválido em despesa, receita, transferência e distribuição.
- Negativos inválidos.
- Não inventar teto.
- Não usar `parseFloat`, `Number` ou `toFixed` para cálculos/comparações monetárias.
- Usar string decimal ou biblioteca decimal exata.
- Payload como string decimal na escala exigida pelo endpoint.
- Moedas comuns têm duas casas; aceitar até quatro apenas quando o contrato exigir.
- Escala e arredondamento definitivos continuam pendentes em ARC-003.

### Datas
- UI: `dd/MM/yyyy`.
- API para data simples: `YYYY-MM-DD`.
- Timestamp: ISO 8601 com timezone quando o endpoint pedir instante.
- Hoje por defeito para despesa, receita, transferência e pagamento.
- Não bloquear passado/futuro universalmente.
- Data futura não confirma pagamento.
- Calendário desktop/tablet ancorado e acessível por teclado; mobile pode usar date picker em sheet com confirmação.
- Evitar desvios de dia por conversão indevida de timezone.

## 10. Validação e mensagens

Três níveis:
1. Formato: preenchimento, data e dinheiro válidos.
2. Formulário: valor positivo, contas diferentes, distribuição totalizada.
3. Backend: autorização, propriedade, disponibilidade, consistência e integridade financeira.

Recomendação técnica: Zod + React Hook Form.

Mensagens padrão:
- “Este campo é obrigatório.”
- “Introduz uma descrição.”
- “Introduz um valor válido.”
- “O valor deve ser superior a zero.”
- “Seleciona uma categoria.”
- “Seleciona uma conta.”
- “Seleciona duas contas diferentes.”
- “Ainda não existem categorias disponíveis.”
- “Ainda não existem contas disponíveis.”
- “Distribui todo o valor inicial pelas faturas.”
- “A distribuição não pode ultrapassar o valor declarado.”
- “Seleciona uma fatura válida deste cartão.”
- “O valor excede o montante ainda disponível para pagamento.”
- “Introduz uma data válida.”

## 11. Estados, erros e feedback

Estados a suportar: inicial, focado, preenchido, inválido, incompleto, enviando, sucesso, erro de validação, erro API, erro de rede, reabertura após erro, cancelamento, sem dados e loading.

Mapeamento HTTP:
- 401: solicitar nova autenticação.
- 403: falta de autorização.
- 404: recurso indisponível.
- 409: conflito.
- 422: erros de campo e/ou resumo.
- 429: excesso de pedidos.
- 500: erro geral.
- Timeout/rede: erro de comunicação; preservar formulário.

Nunca expor SQL, stack trace ou classes Laravel. Para operação financeira, não repetir automaticamente após timeout sem idempotência. Se o resultado for desconhecido, revalidar operação/lista antes de permitir nova submissão.

Feedback:
- Erro de campo junto ao campo; vários erros também no resumo.
- Erro API no formulário; erro de rede com opção de repetir.
- Sucesso em Toast; erros persistentes não podem depender apenas de Toast.
- Fecho com alterações e reversão financeira exigem confirmação contextual.
- Sem dados: EmptyState; falha de leitura: ErrorState; carregamento: LoadingState.

Mensagens de sucesso:
- “Despesa guardada com sucesso.”
- “Receita guardada com sucesso.”
- “Transferência registada com sucesso.”
- “Conta criada com sucesso.”
- “Conta atualizada com sucesso.”
- “Cartão criado com sucesso.”
- “Cartão atualizado com sucesso.”
- “Saldo inicial configurado com sucesso.”
- “Pagamento registado com sucesso.”

Mensagens gerais:
- “Não foi possível guardar as alterações.”
- “Verifica a tua ligação à internet e tenta novamente.”

## 12. Rascunhos

Não persistir rascunhos nesta fase:
- Estado local enquanto o formulário estiver aberto.
- Preservar em erros de validação/API/rede.
- Fechar sem alterações diretamente; com alterações, confirmar.
- “Sair sem guardar” descarta.
- Atualizar página perde rascunho; reabrir inicia formulário novo.
- Não guardar dados financeiros em localStorage nesta fase.

## 13. Arquitetura de implementação

Fluxo: abrir → carregar dados → preencher → validar → normalizar → chamar API → interpretar resposta → atualizar dados afetados → fechar e apresentar Toast. Em erro, preservar o formulário.

Tipos internos conceptuais:
```ts
type MoneyValue = string;
type ISODate = string;

type ExpenseFormValues = {
  description: string;
  amount: MoneyValue;
  categoryId: number | null;
  accountId: number | null;
  date: ISODate;
};

type TransferFormValues = {
  sourceAccountId: number | null;
  destinationAccountId: number | null;
  amount: MoneyValue;
  date: ISODate;
  description: string;
};
```
Adaptadores convertem tipos internos nos payloads efetivamente aceites pela API. Não fazer atualização otimista de saldos; revalidar apenas dados afetados. Pagamento atualiza conta e faturas sem criar despesa.

## 14. Situação da API identificada

Rotas encontradas na inspeção:
- `GET /cards`
- `GET /cards/{card}`
- `GET /invoices`
- `GET /operations`
- `POST /cards/{card}/opening-balance`
- `POST /purchases`
- `POST /operations/{payment}/payment-allocations`
- `POST /payment-allocations/{allocation}/reversals`

Não foram identificados endpoints para criar/editar contas, despesa comum, receita comum, transferência, criar/editar cartões ou criar um pagamento completo. Não assumir que não existem fora das rotas inspecionadas; confirmar no repositório antes de implementar integração.

Outras dependências:
- ARC-003: escala monetária e arredondamento.
- Enum técnico de tipos de conta e contrato de categorias.
- Fluxo completo de pagamento.
- Regra de atribuição da compra ao ciclo no próprio dia de fecho.

## 15. Plano de implementação

**Fase 1 — Infraestrutura visual (P0)**
- FormModal, FormSheet, FullScreenForm e ResponsiveFormContainer.
- FormLayout e FormField.
- Inputs reutilizáveis e acessíveis.
- Estados e feedback global.

**Fase 2 — Motor comum (P0)**
- Estado central do formulário.
- Schemas Zod.
- Normalizadores monetário e de datas.
- API Error Mapper.
- Proteção de alterações por guardar.

**Fase 3 — Movimentos (P1)**
- Despesa, receita e transferência.
- Integrar apenas quando existir endpoint real e contrato confirmado.

**Fase 4 — Contas e cartões (P1)**
- Criar/editar contas e cartões após confirmação dos endpoints.
- Consulta de faturas.

**Fase 5 — Operações especializadas (P2)**
- Saldo inicial, pagamento e reversão, respeitando integridade e rastreabilidade.

## 16. Critérios gerais de aceitação

- Dashboard intacto; paleta e Design System preservados.
- Mesmo formulário em desktop, tablet e mobile; muda apenas o recipiente.
- Componentes genéricos não acedem diretamente ao backend.
- Nenhuma operação é considerada realizada apenas pela data.
- Transferência não é receita/despesa.
- Pagamento de fatura não duplica despesa; saldo inicial fica integralmente distribuído.
- Pagamentos parciais/multi-fatura e reversões mantêm rastreabilidade.
- Sem submissões duplicadas; saldos atualizados apenas após confirmação.
- Campos acessíveis; loading, erro e sucesso previstos.
- Falha de rede preserva dados; dinheiro sem float; datas sem desvio de timezone.
- Testes válidos/inválidos em desktop, tablet e mobile.

## 17. Decisão final

A implementação pode começar pela infraestrutura visual, componentes, validações e formulários cuja integração não dependa de contratos inexistentes ou não confirmados.

Não considerar todas as operações financeiras integradas em produção até os contratos de API estarem confirmados. O Dashboard permanece intacto; o backend não é alterado e a Fase 1 não exige migrations.

**Quatro regras orientadoras**
1. Um único sistema de formulários, não três versões por dispositivo.
2. Um formulário genérico, especializado apenas pelas necessidades reais de cada operação.
3. Nenhum efeito financeiro pode ser inventado pelo frontend.
4. Nenhuma operação é concluída antes da confirmação do backend.
