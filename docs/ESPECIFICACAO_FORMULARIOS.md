# Orbe — Especificação visual dos formulários e interações

**Estado:** catálogo visual aprovado  
**Data da aprovação:** 24/11/2026  
**Âmbito:** decisões de UX, apresentação visual e interação dos formulários  
**Projeto:** Orbe — React, TypeScript, Vite e Tamagui

---

## 1. Objetivo e autoridade deste documento

Este documento regista exclusivamente as decisões visuais e de interação aprovadas para os formulários do Orbe. Deve ser usado como referência por qualquer pessoa ou IA que trabalhe na interface.

O conteúdo substitui a especificação anterior. Não transportar para esta versão requisitos técnicos, regras financeiras, campos, payloads, endpoints ou comportamentos de backend que não tenham sido aprovados no processo de definição visual.

### Limites obrigatórios

- Esta especificação **não autoriza o início da implementação**. É uma referência de decisões aprovadas.
- Não alterar nem redesenhar o Dashboard aprovado.
- Preservar a identidade visual, os tokens e o Design System existentes no projeto.
- Não inventar campos, opções, validações, regras financeiras, permissões ou estados de negócio.
- Não interpretar exemplos visuais como definição de requisitos funcionais.
- Não implementar integração com API, backend, base de dados ou persistência como consequência deste documento.
- Antes de implementar, consultar a documentação funcional e as regras de negócio aprovadas.
- Quando faltar uma decisão funcional, assinalar a lacuna em vez de a preencher por suposição.

---

## 2. Identidade visual e sistema de campos

| Elemento | Decisão aprovada |
|---|---|
| Campos | Contorno (outlined) |
| Etiquetas | Acima dos campos |
| Botões principais | Preenchidos (filled) |
| Cor principal | Violeta do Design System: `#6254f5` |
| Superfícies | Manter tokens e componentes existentes |
| Consistência | Reutilizar padrões visuais entre formulários |

A interface deve manter a linguagem visual já adotada pelo Orbe. Não criar uma identidade paralela para os formulários.

---

## 3. Recipientes responsivos

O recipiente depende do dispositivo e da extensão do formulário.

| Contexto | Padrão aprovado |
|---|---|
| Desktop e tablet | Modal centralizado |
| Mobile | Bottom sheet |
| Formulário extenso | Ecrã completo (full screen) |

### Comportamento visual

- O modal centralizado é o padrão para desktop e tablet.
- O bottom sheet é o padrão para formulários em mobile.
- Formulários extensos ocupam o ecrã completo, independentemente de serem divididos em etapas.
- O conteúdo pode ter scroll próprio quando necessário.
- Quando existir rodapé de ações, este permanece fixo.
- Respeitar as áreas seguras do dispositivo (safe areas), sobretudo no mobile.

Não fixar breakpoints ou dimensões neste documento. Devem ser respeitados os critérios responsivos já existentes no projeto.

---

## 4. Padrão visual dos campos e seletores

### Categorias

- Apresentar numa lista simples.
- Cada categoria pode ser identificada por um ícone.
- Não usar grelha de cartões.
- Não transformar o seletor numa lista pesquisável.

### Contas e cartões

- Usar listas compactas para seleção.
- Evitar cartões grandes ou apresentações excessivamente elaboradas dentro do seletor.

### Valor monetário

- O valor deve ter destaque visual no formulário.
- Não integrar o teclado numérico como elemento visual permanente do campo.
- Manter o padrão de campo definido no Design System.

### Data

- Disponibilizar atalhos rápidos:
  - Hoje
  - Ontem
  - Escolher data

Os exemplos acima definem a apresentação do controlo, não as regras de aceitação de datas.

---

## 5. Formulários principais

### Despesa e receita

- Despesa e receita usam a mesma estrutura visual.
- A receita mantém a identidade visual da despesa.
- A natureza da operação deve ser distinguível sem criar dois sistemas visuais independentes.
- O valor pode usar diferenciação visual coerente com a natureza da operação.
- Reutilizar os mesmos padrões de campos, seletores, ações e feedback.

A estrutura visual comum não significa que os campos, categorias ou regras funcionais sejam necessariamente iguais. Esses elementos devem seguir a especificação funcional aprovada.

### Transferência

- Usar seletores compactos para conta de origem e conta de destino.
- Manter o valor em destaque.
- A apresentação deve deixar clara a distinção entre origem e destino.
- Não reutilizar a aparência de despesa/receita de forma que confunda a natureza da transferência.

### Componentes partilhados

Os padrões visuais devem ser reutilizáveis. Não criar uma versão independente de cada campo ou interação para cada formulário quando o mesmo padrão servir.

---

## 6. Contas e cartões

### Formulário de conta

- Apresentação simples.
- Campos organizados em sequência.
- Não adicionar etapas sem necessidade visual ou funcional confirmada.

### Formulário de cartão

- Incluir uma pré-visualização visual do cartão durante a criação/edição.
- A pré-visualização é um elemento de apresentação, não uma autorização para inventar dados ou campos.
- Os campos efetivos dependem da especificação funcional aprovada.

### Saldo inicial

- Usar um formulário próprio, separado dos formulários comuns.
- A apresentação deve deixar clara a natureza específica desta operação.
- Não o representar visualmente como uma despesa ou receita comum.

### Pagamento de fatura

- Apresentar um resumo da operação antes da confirmação.
- O resumo deve organizar visualmente os dados efetivamente definidos para a operação.
- Não inventar valores, distribuições ou regras de pagamento.

---

## 7. Confirmações, menus e ações contextuais

### Edição

- Reutilizar o mesmo formulário de criação.
- O formulário deve apresentar os dados existentes em modo de edição, conforme os dados disponíveis e as regras funcionais.

### Eliminação

- Exigir confirmação contextual.
- A confirmação deve apresentar detalhes suficientes para identificar o registo que será eliminado.
- Não usar uma confirmação genérica que esconda qual é o alvo da ação.

### Reversão

- Exigir confirmação contextual.
- Apresentar detalhes da operação original.
- Não confundir reversão com eliminação ou edição.

### Menus contextuais

- Adaptar a apresentação ao dispositivo.
- No mobile, usar bottom sheet.
- Em desktop/tablet, usar o padrão contextual adequado à interface.

A decisão visual sobre uma confirmação ou menu não determina se uma ação está autorizada ou disponível. As regras de negócio e permissões existentes continuam a determinar isso. Ações não permitidas não devem ser apresentadas como disponíveis.

---

## 8. Navegação e experiência dos formulários

### Abertura dos formulários

**Decisão aprovada: quick**

- Abrir formulários através de ações rápidas e botões nos cabeçalhos das páginas.
- A ação deve estar associada ao contexto da página ou da operação.
- Não adotar um botão flutuante global em todas as páginas como padrão.
- Não criar acessos que não correspondam a ações existentes e permitidas.

### Formulários extensos

**Decisão aprovada: multi**

- Dividir formulários extensos em etapas.
- Cada etapa deve ter um objetivo compreensível.
- Apresentar um indicador de progresso ou identificação da etapa atual.
- Permitir avançar e voltar entre etapas.
- Preservar os valores já preenchidos ao navegar entre etapas.
- Não dividir formulários simples em várias etapas artificialmente.
- O padrão de ecrã completo continua a aplicar-se a formulários extensos.

### Posição das ações

**Decisão aprovada: fixed**

- Manter as ações principais num rodapé fixo.
- O rodapé não deve desaparecer durante o scroll do conteúdo.
- No mobile, respeitar as safe areas e não deixar os controlos encobertos pelo teclado.
- A ação principal deve usar o estilo de botão preenchido definido no Design System.

### Fecho com alterações

**Decisão aprovada: preserve**

- Se o utilizador tentar fechar um formulário com alterações por guardar, apresentar um aviso de confirmação.
- Disponibilizar uma opção para continuar a editar.
- Disponibilizar uma opção explícita para sair sem guardar.
- Não descartar automaticamente os dados preenchidos.
- Se o utilizador escolher continuar, manter o formulário e os valores.

---

## 9. Estados e feedback visual

### Confirmações

- Padrão adaptativo:
  - Desktop/tablet: modal centralizado.
  - Mobile: diálogo inferior.

### Notificações

- Usar Toast discreto.
- Evitar notificações excessivamente grandes ou intrusivas.

### Carregamento

- Mostrar o indicador de carregamento no próprio botão que iniciou a ação.
- Manter a hierarquia visual do botão durante o carregamento.

### Erros e estados vazios

- Apresentar mensagens junto ao conteúdo ou campo afetado.
- Evitar depender exclusivamente de notificações Toast para erros que exigem correção.
- Estados vazios devem aparecer no contexto em que os dados seriam apresentados.

Estas decisões definem apenas a apresentação visual. O significado dos estados e as condições que os ativam dependem das regras funcionais do projeto.

---

## 10. Padrões visuais reutilizáveis

Os seguintes elementos representam famílias de componentes e padrões a considerar na interface. A lista não impõe nomes de componentes, props, APIs internas ou arquitetura de implementação.

- Recipiente responsivo de formulário.
- Modal centralizado.
- Bottom sheet.
- Formulário em ecrã completo.
- Cabeçalho de formulário.
- Campo com etiqueta superior.
- Campo monetário em destaque.
- Seletor compacto de conta/cartão.
- Lista simples de categorias com ícones.
- Seletor de data com atalhos.
- Rodapé fixo de ações.
- Navegação entre etapas e indicador de progresso.
- Pré-visualização de cartão.
- Resumo de operação.
- Diálogo de confirmação contextual.
- Menu contextual adaptativo.
- Toast discreto.
- Indicador de carregamento no botão.
- Mensagem de erro contextual.
- Estado vazio contextual.

A implementação deve privilegiar os componentes e tokens já existentes no projeto, sem criar abstrações desnecessárias.

---

## 11. Matriz consolidada de decisões aprovadas

| Área | Decisão |
|---|---|
| Campos | Contorno |
| Etiquetas | Acima dos campos |
| Botões | Preenchidos |
| Desktop/tablet | Modal centralizado |
| Mobile | Bottom sheet |
| Formulários extensos | Ecrã completo |
| Categorias | Lista simples com ícones |
| Contas/cartões | Lista compacta |
| Valor monetário | Valor em destaque |
| Data | Atalhos rápidos |
| Confirmações | Adaptativas |
| Notificações | Toast discreto |
| Carregamento | Indicador no botão |
| Erros e estados vazios | Contextuais |
| Despesa/receita | Mesma estrutura visual |
| Identidade da receita | Mesma identidade visual, com distinção da natureza |
| Transferência | Seletores compactos de origem/destino |
| Componentes | Padrões reutilizáveis |
| Conta | Formulário simples, campos em sequência |
| Cartão | Pré-visualização visual |
| Saldo inicial | Formulário próprio |
| Pagamento de fatura | Resumo antes da confirmação |
| Edição | Reutilizar formulário de criação |
| Eliminação | Confirmação com detalhes |
| Reversão | Confirmação com detalhes da operação original |
| Menu contextual | Adaptativo |
| Menu mobile | Bottom sheet |
| Abertura | Ações rápidas e botões nos cabeçalhos |
| Formulários extensos | Divididos em etapas |
| Ações | Rodapé fixo |
| Fecho com alterações | Avisar e preservar dados |

---

## 12. Instruções para a IA ou equipa que receber este documento

1. Tratar todas as decisões da matriz como aprovadas para a camada visual.
2. Não reabrir decisões já aprovadas sem identificar um conflito real com o produto ou com uma regra existente.
3. Não transformar exemplos ou recomendações visuais em requisitos funcionais.
4. Não inferir campos, validações, permissões, regras financeiras, estados de negócio ou contratos de API.
5. Antes de qualquer implementação, cruzar os formulários com a documentação funcional e as regras de negócio atuais.
6. Se existir conflito entre esta especificação visual e uma regra funcional aprovada, não resolver por suposição: identificar o conflito e pedir decisão.
7. Nesta fase documental, não alterar código, backend, base de dados ou integrações.
8. O Dashboard aprovado permanece fora do âmbito de redesenho.

**Resultado esperado:** uma interface de formulários consistente com o Orbe e fiel às decisões visuais aprovadas, sem introduzir comportamento funcional que não tenha sido especificado.
