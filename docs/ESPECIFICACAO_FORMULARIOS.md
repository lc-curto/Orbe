# Orbe — Especificação visual e de interação dos formulários

**Estado:** aprovado pelo utilizador  
**Data da aprovação:** 24/11/2026  
**Âmbito:** interface, composição visual, responsividade e interação dos formulários  
**Stack do projeto:** React, TypeScript, Vite e Tamagui  
**Documento único de referência:** este ficheiro substitui integralmente qualquer versão anterior desta especificação.

---

## 1. Objetivo e instrução principal

Este documento transmite a outra IA ou equipa como construir visualmente os formulários do Orbe de acordo com as decisões aprovadas pelo utilizador.

A implementação deve reproduzir os padrões, a hierarquia e os comportamentos descritos aqui. A IA não deve escolher livremente outro padrão visual, simplificar decisões aprovadas ou introduzir componentes visuais incompatíveis.

**Este documento é uma especificação visual e de interação, não uma especificação funcional.** Não define regras financeiras, campos definitivos, permissões, validações de negócio, estados financeiros, contratos de API ou arquitetura de backend.

### Regras inegociáveis

1. Não redesenhar, alterar ou usar o Dashboard como espaço de experimentação. O Dashboard está aprovado.
2. Preservar o Design System, os tokens, a tipografia, os ícones e os componentes existentes no repositório.
3. Não inventar campos, opções, dados, regras, permissões, estados ou fluxos de negócio.
4. Não interpretar wireframes ou exemplos como autorização para criar campos funcionais.
5. Não alterar backend, API, base de dados, migrations, persistência ou motor financeiro por causa deste documento.
6. Não implementar uma ação que não esteja permitida pelas regras funcionais existentes.
7. Se faltar informação funcional, manter o espaço visual neutro ou assinalar a dependência; não inventar uma solução.
8. Reutilizar componentes existentes sempre que cumpram esta especificação.
9. As decisões abaixo estão aprovadas. Não voltar a perguntar ao utilizador sobre elas sem identificar um conflito real.
10. A aprovação deste documento não é, por si só, autorização para iniciar a implementação. A implementação depende de pedido explícito.

---

## 2. Identidade visual do Orbe

### 2.1 Princípios

- Interface limpa, contemporânea, financeira e discreta.
- Hierarquia visual clara: título, contexto, valor principal, campos, ações.
- Espaçamento consistente e alinhamento rigoroso.
- Evitar excesso de cartões, contornos decorativos, sombras fortes, gradientes ou elementos ornamentais.
- Não competir visualmente com o conteúdo financeiro.
- Manter consistência entre desktop e mobile; adaptar a disposição, não criar identidades diferentes.

### 2.2 Tokens existentes

Usar os tokens já definidos no Design System. A referência visual conhecida inclui:

| Função | Referência |
|---|---|
| Primary | Violeta `#6254f5` |
| Background | `#f7f8fc` |
| Surface | Branco |
| Texto principal | `#17152e` |
| Texto secundário | `#73758a` |
| Border | `#e8e9f0` |
| Sucesso | Token de sucesso existente |
| Erro/perigo | Token de danger existente |

Os valores acima são referências do sistema atual, não autorização para duplicar cores hardcoded. Procurar e utilizar os tokens reais do projeto. Se os tokens tiverem evoluído, prevalece o Design System atual.

### 2.3 Campos e etiquetas

- Todos os campos usam apresentação contornada (outlined).
- A etiqueta fica acima do campo, nunca como substituto permanente dentro do campo.
- O campo deve ter leitura clara de estado normal, foco, preenchido, desativado e erro, quando esses estados forem aplicáveis.
- Placeholders são auxiliares e não substituem etiquetas.
- Não misturar estilos de campo preenchido e contornado no mesmo formulário sem motivo previsto no Design System.

### 2.4 Botões

- A ação principal usa botão preenchido (filled), com a cor primary do Design System.
- Ações secundárias usam o estilo secundário já existente no sistema.
- A hierarquia deve ser inequívoca: uma ação principal por contexto de submissão.
- Não criar botões flutuantes globais como padrão.
- Estados de carregamento mantêm a identidade e a dimensão do botão.

---

## 3. Recipientes e composição responsiva

A escolha do recipiente está aprovada:

| Contexto | Recipiente |
|---|---|
| Desktop | Modal centralizado |
| Tablet | Modal centralizado |
| Mobile | Bottom sheet |
| Formulário extenso | Ecrã completo (full screen) |

### 3.1 Modal centralizado — desktop e tablet

Composição, de cima para baixo:

1. Cabeçalho com título e controlo de fechar.
2. Conteúdo do formulário.
3. Rodapé de ações fixo.

Regras:
- O modal fica centrado no viewport.
- Deve ter largura adequada ao conteúdo, sem ocupar desnecessariamente todo o ecrã.
- O conteúdo pode fazer scroll sem deslocar o cabeçalho nem o rodapé.
- O rodapé permanece visível.
- O fundo da aplicação fica visualmente secundário enquanto o modal está aberto.
- Não empilhar modais para fluxos normais de formulário.

### 3.2 Bottom sheet — mobile

Composição, de cima para baixo:

1. Identificador visual do sheet, se já fizer parte do padrão do projeto.
2. Cabeçalho com título e controlo de fechar.
3. Conteúdo rolável.
4. Rodapé de ações fixo.

Regras:
- O sheet ocupa a largura disponível.
- A abertura deve parecer uma superfície contínua ligada à base do ecrã.
- Cantos superiores arredondados, conforme os tokens existentes.
- O conteúdo pode fazer scroll; cabeçalho e rodapé permanecem acessíveis.
- Respeitar safe areas.
- O teclado não pode tapar o campo ativo nem as ações.
- Não fechar acidentalmente durante a interação com campos.
- Não transformar formulários extensos em sheets comprimidos: usar full screen.

### 3.3 Formulário em ecrã completo

Usar para formulários classificados como extensos, especialmente quando existe navegação por etapas.

Composição:
1. Cabeçalho com título, contexto e fecho.
2. Indicador da etapa/progresso.
3. Conteúdo da etapa atual, com scroll quando necessário.
4. Rodapé fixo com ações de navegação.

Regras:
- O ecrã completo não significa que todos os campos devam aparecer de uma só vez.
- A etapa atual deve ter foco visual.
- Não mostrar etapas futuras como se fossem formulários já preenchíveis.
- Preservar os valores ao avançar e voltar.
- Não dividir formulários curtos em etapas artificiais.

### 3.4 Dimensões e breakpoints

Não introduzir dimensões arbitrárias nesta especificação. Consultar os breakpoints, espaçamentos, raios e tamanhos já definidos no projeto. A regra visual aprovada é o tipo de recipiente e a sua composição, não um conjunto novo de medidas hardcoded.

---

## 4. Estrutura padrão de um formulário

A estrutura visual comum é:

```text
┌──────────────────────────────────────┐
│ Título do formulário              [X]│  Cabeçalho
├──────────────────────────────────────┤
│                                      │
│ Etiqueta                             │
│ ┌──────────────────────────────────┐ │
│ │ Campo contornado                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Etiqueta                             │
│ ┌──────────────────────────────────┐ │
│ │ Campo contornado                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Conteúdo adicional, se aplicável     │  Área rolável
│                                      │
├──────────────────────────────────────┤
│ [Ação secundária] [Ação principal]   │  Rodapé fixo
└──────────────────────────────────────┘
```

O desenho é um wireframe estrutural, não uma imagem final nem uma definição de campos.

### Regras

- O título identifica claramente a operação.
- As etiquetas ficam imediatamente acima dos respetivos campos.
- Os campos seguem uma ordem visual lógica definida pelo formulário funcional.
- O conteúdo não deve ficar encostado aos limites do recipiente.
- O rodapé é separado do conteúdo por uma divisão subtil ou pelo tratamento já usado no Design System.
- O rodapé não pode cobrir o último campo.
- Em formulários com scroll, o scroll pertence ao conteúdo, não ao recipiente inteiro.
- O formulário deve manter alinhamentos consistentes.

---

## 5. Campos e controlos reutilizáveis

### 5.1 Campo de texto

- Etiqueta superior.
- Input contornado.
- Placeholder apenas quando ajuda a explicar o formato esperado.
- Mensagem de erro diretamente associada ao campo.
- Não adicionar ícones internos decorativos por defeito.

### 5.2 Valor monetário — destaque

O valor é um dos elementos visuais centrais do formulário.

- Apresentar o valor com maior destaque tipográfico do que os restantes campos.
- Manter a etiqueta acima do campo.
- A moeda deve ser identificável sem competir com o número.
- Não incorporar um teclado numérico permanente na interface.
- Não usar um cartão decorativo separado apenas para aumentar o valor.
- O campo continua a respeitar a linguagem outlined do Design System.

Wireframe de intenção:

```text
Valor
┌──────────────────────────────────────┐
│  €                         125,00    │
└──────────────────────────────────────┘
```

O exemplo é ilustrativo. Não determina moeda, valor, escala decimal ou regra de formatação.

### 5.3 Categorias — lista simples com ícones

**Decisão aprovada: lista simples.**

- Apresentar opções em linhas compactas.
- Ícone à esquerda, nome da categoria ao lado.
- Estado selecionado visível, sem transformar toda a lista numa grelha de cartões.
- Não usar grelha.
- Não usar pesquisa como padrão.
- Não inventar categorias nem ícones específicos: usar os dados e ícones existentes.

Wireframe:

```text
Escolher categoria
┌──────────────────────────────────────┐
│ [ícone] Categoria existente       ✓  │
│ [ícone] Categoria existente          │
│ [ícone] Categoria existente          │
└──────────────────────────────────────┘
```

### 5.4 Contas e cartões — lista compacta

- Apresentar cada opção numa linha compacta.
- Nome da conta/cartão como elemento principal.
- Informação secundária apenas quando já existe e é relevante.
- Seleção facilmente identificável.
- Não usar cartões grandes nem pré-visualizações de cartão dentro do seletor.
- A pré-visualização visual do cartão é exclusiva do formulário de criação/edição de cartão.

### 5.5 Data — atalhos rápidos

Apresentar os atalhos junto ao controlo de data:

```text
Data
[ Hoje ] [ Ontem ] [ Escolher data ]
```

- Os atalhos devem ser compactos e visualmente relacionados com o campo.
- O atalho ativo deve ter estado selecionado claro.
- “Escolher data” abre o mecanismo de seleção de data adequado ao dispositivo.
- Não inferir restrições de datas a partir deste padrão visual.

---

## 6. Especificação visual por formulário

Os campos efetivos e a sua obrigatoriedade devem vir da documentação funcional aprovada. Esta secção define a composição visual, não uma lista nova de campos.

### 6.1 Despesa

**Recipiente:** modal centralizado em desktop/tablet; bottom sheet em mobile, salvo se o formulário for classificado como extenso pela especificação funcional.

**Composição:**
1. Título que identifique a criação de despesa.
2. Campo de valor em destaque.
3. Campos funcionais da despesa, com etiquetas superiores e contorno.
4. Seletor de categoria em lista simples com ícones.
5. Seletor de conta em lista compacta.
6. Controlo de data com atalhos rápidos.
7. Rodapé fixo com ação secundária e ação principal.

**Regras visuais:**
- Valor deve ser o primeiro foco visual do conteúdo.
- Campos restantes devem ter hierarquia mais discreta.
- Não transformar cada campo num cartão independente.
- A ordem funcional definitiva dos campos deve ser respeitada; não inventar campos adicionais.

Wireframe conceptual:

```text
Nova despesa                           [X]
Valor
┌──────────────────────────────────────┐
│ €                         0,00       │
└──────────────────────────────────────┘
[Campos definidos pela especificação funcional]
Categoria
[Lista simples com ícones]
Conta
[Seletor compacto]
Data
[Hoje] [Ontem] [Escolher data]
────────────────────────────────────────
[Cancelar]                 [Guardar]
```

### 6.2 Receita

**Estrutura:** igual à despesa.

- Reutilizar a hierarquia, o espaçamento, o tipo de campos e o recipiente.
- A receita mantém a mesma identidade visual geral.
- Distinguir a natureza da operação com tratamento visual coerente, por exemplo na cor do valor, sem criar um segundo design system.
- Não usar uma cor diferente em todos os elementos indiscriminadamente.
- Se a receita usar categorias ou campos diferentes por regra funcional, respeitar essa diferença sem alterar a estrutura visual comum.

### 6.3 Transferência

**Recipiente:** modal centralizado em desktop/tablet; bottom sheet em mobile, salvo classificação funcional diferente.

**Composição:**
1. Título de transferência.
2. Seletor compacto da conta de origem.
3. Elemento visual claro de separação/direção entre origem e destino.
4. Seletor compacto da conta de destino.
5. Valor em destaque.
6. Data e outros campos apenas se definidos funcionalmente.
7. Rodapé fixo.

**Regras:**
- Origem e destino têm de ser visualmente distinguíveis.
- Não apresentar os dois seletores como um campo ambíguo.
- Não usar a identidade de despesa ou receita.
- Não adicionar animações ou ilustrações que prejudiquem a leitura.

Wireframe:

```text
Nova transferência                    [X]
Origem
[Conta de origem                  ▾]
              ↓
Destino
[Conta de destino                 ▾]
Valor
[€                              0,00]
[Restantes campos funcionais, se existirem]
────────────────────────────────────────
[Cancelar]                 [Continuar]
```

### 6.4 Criar/editar conta

- Formulário simples, sem etapas.
- Campos organizados em sequência vertical.
- Recipiente responsivo conforme a secção 3.
- Rodapé fixo.
- Edição reutiliza a mesma composição de criação, preenchida com os dados existentes.
- Não criar pré-visualização decorativa de conta.
- Não acrescentar campos não definidos funcionalmente.

### 6.5 Criar/editar cartão

**Elemento distintivo aprovado: pré-visualização visual do cartão.**

Composição:
1. Cabeçalho do formulário.
2. Pré-visualização do cartão numa área própria e visualmente destacada.
3. Campos funcionais de criação/edição organizados abaixo.
4. Rodapé fixo.

Regras da pré-visualização:
- Deve parecer um cartão, com proporções e tratamento visual coerentes com o Orbe.
- Usar apenas informação que exista nos campos/dados efetivos.
- Não inventar banco, bandeira, últimos dígitos, titular, número, validade ou outros dados.
- Se um dado não existir, não o fabricar para preencher o desenho.
- A pré-visualização é informativa; não deve dominar o formulário.
- Na edição, atualizar a pré-visualização com os dados disponíveis.

Wireframe conceptual:

```text
Novo cartão                            [X]
┌──────────────────────────────────────┐
│                                      │
│        PRÉ-VISUALIZAÇÃO              │
│        Dados realmente disponíveis   │
│                                      │
└──────────────────────────────────────┘
[Campos definidos pela especificação funcional]
────────────────────────────────────────
[Cancelar]                 [Guardar]
```

### 6.6 Saldo inicial

- Formulário próprio e visualmente separado dos formulários de despesa/receita.
- Utilizar ecrã completo quando classificado como extenso, sobretudo em mobile.
- Explicar visualmente o contexto da operação através do título e de um resumo dos dados definidos funcionalmente.
- Se houver várias etapas, aplicar o padrão multi-step da secção 7.
- Não o representar como despesa ou receita.
- Não inventar campos, valores ou distribuições.

### 6.7 Pagamento de fatura

- Apresentar um resumo visual da operação antes da confirmação.
- O resumo deve agrupar os dados reais da operação numa área fácil de rever.
- Destacar a informação principal sem criar cartões excessivos.
- Se existirem valores/distribuições definidos funcionalmente, apresentá-los de forma legível e alinhada.
- A ação final deve ser claramente distinguível.
- Não inventar montantes, distribuições, faturas ou regras de pagamento.
- O resumo não substitui a confirmação exigida pela regra funcional.

### 6.8 Edição, eliminação e reversão

**Edição**
- Reutilizar a composição do formulário de criação.
- Alterar apenas o título/contexto e preencher os valores existentes.
- Não criar um formulário de edição com design independente.

**Eliminação**
- Confirmação contextual.
- Identificar claramente o registo alvo e apresentar detalhes disponíveis suficientes para evitar ambiguidade.
- A ação destrutiva deve ser visualmente diferenciada e não ser confundida com a ação neutra.

**Reversão**
- Confirmação contextual própria.
- Mostrar detalhes da operação original.
- Deixar claro que se trata de reverter a operação, não de eliminar ou editar o registo.
- Não inventar efeitos ou consequências financeiras no texto da confirmação.

---

## 7. Formulários extensos e navegação por etapas

**Decisão aprovada: multi-step.**

Formulários extensos são divididos em etapas, apresentados em ecrã completo. Não usar um formulário longo com todos os campos empilhados quando a sua extensão justificar etapas.

### 7.1 Estrutura

```text
┌──────────────────────────────────────┐
│ Título do formulário              [X]│
│ Etapa 2 de N                         │
│ [●────●────○────○]                   │
├──────────────────────────────────────┤
│                                      │
│ Título/objetivo da etapa atual       │
│                                      │
│ Campos desta etapa                  │
│                                      │
│                                      │
├──────────────────────────────────────┤
│ [Voltar]                  [Continuar]│
└──────────────────────────────────────┘
```

O número de etapas, títulos e campos dependem do formulário funcional. Não criar etapas ou conteúdo para preencher um indicador.

### 7.2 Regras de interação

- Indicar claramente a etapa atual e o progresso.
- Mostrar apenas os campos da etapa atual, salvo se uma pré-visualização/resumo tiver sido aprovada para aquele fluxo.
- A ação principal avança para a próxima etapa.
- A ação de voltar permite rever etapas anteriores.
- Preservar os dados preenchidos ao avançar e voltar.
- Não perder valores ao ocorrer um erro.
- A última etapa apresenta a ação final adequada ao fluxo.
- Não permitir avançar quando as validações funcionais daquela etapa falharem; não inventar validações.
- A navegação entre etapas não deve parecer uma sequência de páginas independentes.

### 7.3 Rodapé fixo

- O rodapé permanece fixo enquanto o conteúdo da etapa faz scroll.
- No mobile, considerar teclado e safe areas.
- Os botões devem ter hierarquia clara.
- Não colocar ações principais apenas no topo ou no fim do conteúdo rolável.

---

## 8. Abertura dos formulários

**Decisão aprovada: quick.**

- Os formulários são abertos por ações rápidas e botões nos cabeçalhos das páginas.
- O botão deve estar no contexto da página à qual a operação pertence.
- A ação deve ter rótulo claro e, quando adequado, ícone consistente com o Design System.
- Não adicionar FAB (floating action button) global em todas as páginas.
- Não duplicar ações no cabeçalho e num botão flutuante sem necessidade aprovada.
- Não expor ações que não sejam permitidas no estado atual do registo.
- Não alterar a navegação global aprovada para acomodar formulários.

---

## 9. Rodapé fixo e fecho com alterações

### 9.1 Rodapé fixo — decisão fixed

- A área de ações fica presa à base do recipiente.
- O conteúdo do formulário é a única área que faz scroll.
- Deve existir separação visual suficiente entre conteúdo e rodapé.
- O último campo deve continuar acessível e não ficar escondido atrás do rodapé.
- Em mobile, respeitar safe areas e o teclado.
- O rodapé deve manter os mesmos alinhamentos e hierarquia entre formulários.

### 9.2 Fecho — decisão preserve

Quando o utilizador tenta sair com alterações por guardar:

```text
┌──────────────────────────────────────┐
│ Existem alterações por guardar       │
│                                      │
│ Se sair agora, as alterações não     │
│ serão guardadas.                     │
│                                      │
│ [Continuar a editar]                 │
│ [Sair sem guardar]                   │
└──────────────────────────────────────┘
```

- Mostrar confirmação adaptada ao dispositivo: modal central em desktop/tablet e diálogo inferior em mobile.
- A opção de continuar fecha o aviso e mantém o formulário intacto.
- A opção de sair sem guardar descarta os valores locais do formulário.
- Nunca descartar automaticamente quando o utilizador apenas tenta fechar.
- Não mostrar aviso se não existirem alterações por guardar.
- Não assumir persistência de rascunhos depois de fechar ou atualizar a página.

---

## 10. Confirmações, menus e feedback

### 10.1 Confirmações adaptativas

| Dispositivo | Apresentação |
|---|---|
| Desktop/tablet | Modal centralizado |
| Mobile | Diálogo inferior |

Confirmações devem ter:
- Título claro.
- Explicação curta e contextual.
- Identificação do objeto/operação quando aplicável.
- Ação de cancelamento/continuação.
- Ação principal coerente com a decisão.

### 10.2 Menus contextuais

- Adaptar ao dispositivo.
- Desktop/tablet: menu contextual ancorado ao elemento que o abriu, se esse for o padrão existente.
- Mobile: bottom sheet.
- Mostrar apenas ações permitidas naquele contexto.
- Não criar menus com opções indisponíveis ou meramente decorativas.

### 10.3 Toast

- Discreto, curto e sem ocupar a área principal.
- Usar o padrão de Toast já existente.
- Não substituir mensagens de erro que exijam ação ou correção.
- Não usar Toast como confirmação única de uma ação destrutiva.

### 10.4 Loading

- O indicador aparece dentro do botão que iniciou a ação.
- Manter o rótulo ou contexto da ação legível.
- Evitar deslocamento do layout durante o carregamento.
- Não criar ecrã de loading total para uma ação localizada, salvo necessidade real do sistema.

### 10.5 Erros

- Erro de campo imediatamente junto ao campo correspondente.
- Erro geral junto à área ou ação que falhou.
- Não depender apenas de cor: usar mensagem textual e estado visual.
- Não apresentar erros técnicos internos ao utilizador.

### 10.6 Estados vazios

- Aparecem no local onde o conteúdo deveria estar.
- Explicam de forma concisa que não existem opções/registos disponíveis.
- A ação auxiliar só aparece se existir uma ação funcional real e permitida.
- Não criar ilustrações ou CTA fictícios para preencher espaço.

---

## 11. Componentes visuais a reutilizar

Esta é uma lista de responsabilidades visuais, não uma exigência de nomes ou props. Antes de criar componentes, verificar o Design System e o código existente.

| Padrão/componente | Responsabilidade visual |
|---|---|
| Recipiente responsivo | Escolher modal, sheet ou full screen conforme contexto |
| Modal central | Formulários/diálogos desktop e tablet |
| Bottom sheet | Formulários/menus/diálogos mobile |
| Formulário full screen | Formulários extensos |
| Cabeçalho de formulário | Título, contexto e fecho |
| Campo contornado | Campo padrão com etiqueta superior |
| Campo monetário | Valor em destaque |
| Lista de categorias | Linhas simples com ícones |
| Seletor de conta/cartão | Lista compacta |
| Seletor de data | Atalhos Hoje, Ontem e Escolher data |
| Rodapé de ações | Ações fixas e consistentes |
| Navegação multi-step | Etapa atual, progresso, voltar e avançar |
| Pré-visualização de cartão | Representação visual dos dados disponíveis |
| Resumo de operação | Revisão visual antes da confirmação |
| Diálogo contextual | Confirmação adaptativa |
| Menu contextual | Ações disponíveis no contexto |
| Toast | Feedback breve |
| Loading de botão | Estado de submissão no botão |
| Erro contextual | Mensagem junto ao elemento afetado |
| Estado vazio | Ausência de conteúdo no contexto correto |

Não criar abstrações excessivas nem duplicar componentes já existentes. A implementação deve respeitar a arquitetura atual do frontend.

---

## 12. Estados visuais de referência

Os estados seguintes são estados de apresentação dos componentes. A condição funcional que os ativa deve vir do sistema existente.

| Estado | Apresentação |
|---|---|
| Normal | Campo contornado, etiqueta visível |
| Foco | Destaque de foco conforme tokens |
| Preenchido | Valor legível e sem perda da etiqueta |
| Selecionado | Seleção evidente em lista/atalho |
| Desativado | Aparência claramente indisponível |
| Erro | Contorno/indicador de erro e mensagem textual |
| Carregamento | Indicador dentro do botão |
| Sucesso | Toast discreto |
| Vazio | Mensagem contextual no local do conteúdo |
| Alterações por guardar | Confirmação antes de sair |

Não criar novos estados de negócio a partir desta tabela.

---

## 13. Matriz de decisões aprovadas

| Área | Decisão final |
|---|---|
| Campos | Contorno (outlined) |
| Etiquetas | Acima dos campos |
| Botões principais | Preenchidos (filled) |
| Cor principal | Violeta do Design System |
| Desktop/tablet | Modal centralizado |
| Mobile | Bottom sheet |
| Formulários extensos | Ecrã completo |
| Categorias | Lista simples com ícones |
| Contas/cartões em seletores | Lista compacta |
| Valor monetário | Valor em destaque |
| Data | Atalhos rápidos: Hoje, Ontem, Escolher data |
| Confirmações | Adaptativas |
| Notificações | Toast discreto |
| Carregamento | Indicador no botão |
| Erros/estados vazios | Contextuais |
| Despesa/receita | Mesma estrutura visual |
| Identidade da receita | Mesma identidade, distinguindo a natureza |
| Transferência | Seletores compactos de origem/destino |
| Componentes | Reutilizáveis |
| Conta | Formulário simples, campos em sequência |
| Cartão | Pré-visualização visual |
| Saldo inicial | Formulário próprio |
| Pagamento de fatura | Resumo antes de confirmar |
| Edição | Reutilizar formulário de criação |
| Eliminação | Confirmação com detalhes do registo |
| Reversão | Confirmação com detalhes da operação original |
| Menu contextual | Adaptativo |
| Menu mobile | Bottom sheet |
| Abertura | Ações rápidas e botões nos cabeçalhos |
| Formulários extensos | Divididos em etapas |
| Ações | Rodapé fixo |
| Fecho com alterações | Avisar e preservar os dados |

---

## 14. Critérios de aceitação visual

A implementação só corresponde a esta especificação quando cumprir os critérios aplicáveis abaixo.

### Identidade e consistência
- [ ] Usa os tokens e componentes existentes do Orbe.
- [ ] Não cria uma identidade visual paralela.
- [ ] Não altera o Dashboard.
- [ ] Campos têm contorno e etiquetas acima.
- [ ] A ação principal é preenchida e visualmente dominante.

### Responsividade
- [ ] Desktop/tablet apresenta formulários comuns em modal centralizado.
- [ ] Mobile apresenta formulários comuns em bottom sheet.
- [ ] Formulários extensos usam ecrã completo.
- [ ] Conteúdo faz scroll sem esconder cabeçalho/rodapé.
- [ ] Rodapé fixo não cobre campos ou conteúdo.
- [ ] Teclado e safe areas são respeitados.

### Controlos
- [ ] Categorias aparecem em lista simples com ícones, sem grelha ou pesquisa por padrão.
- [ ] Contas e cartões usam listas compactas.
- [ ] Valor monetário tem destaque.
- [ ] Data apresenta Hoje, Ontem e Escolher data.

### Formulários
- [ ] Despesa e receita partilham a mesma estrutura visual.
- [ ] Receita distingue a natureza sem criar outro design system.
- [ ] Transferência distingue claramente origem e destino.
- [ ] Conta é simples e sequencial.
- [ ] Cartão apresenta pré-visualização sem dados inventados.
- [ ] Saldo inicial tem formulário próprio.
- [ ] Pagamento de fatura apresenta resumo antes da confirmação.
- [ ] Edição reutiliza a estrutura de criação.

### Navegação e feedback
- [ ] Abertura é feita por ações rápidas/cabeçalhos contextuais, sem FAB global.
- [ ] Formulários extensos têm etapas, progresso, voltar e avançar.
- [ ] Valores são preservados entre etapas.
- [ ] Ações ficam num rodapé fixo.
- [ ] Fecho com alterações pede confirmação e oferece continuar/sair.
- [ ] Confirmações adaptam-se a desktop/tablet e mobile.
- [ ] Toast é discreto.
- [ ] Loading aparece no botão.
- [ ] Erros e estados vazios são contextuais.

### Integridade funcional
- [ ] Não foram inventados campos, regras, permissões ou estados.
- [ ] Não foram implementadas ações indisponíveis segundo as regras funcionais.
- [ ] Nenhuma regra financeira foi alterada.
- [ ] Nenhuma integração/backend foi alterada sem pedido explícito.

---

## 15. Procedimento para a IA que vai implementar

Antes de alterar código:

1. Ler `AGENTS.md`, `README.md` e a documentação funcional relevante.
2. Consultar o estado das decisões e pendências do projeto.
3. Inspecionar os componentes e tokens já existentes no frontend.
4. Mapear cada formulário para os padrões desta especificação.
5. Identificar qualquer campo ou comportamento cuja definição funcional esteja em falta.
6. Apresentar um diagnóstico breve, os ficheiros a alterar e o âmbito da implementação.
7. Não redesenhar o Dashboard nem alterar backend/API/base de dados.
8. Implementar apenas depois de existir autorização explícita para a tarefa.

Durante e depois da implementação:

- Reutilizar componentes existentes sempre que possível.
- Não introduzir valores hardcoded quando existe token.
- Testar visualmente desktop, tablet e mobile.
- Testar scroll, teclado, safe areas, rodapé fixo, etapas e fecho com alterações.
- Comparar a implementação com os critérios de aceitação da secção 14.
- Reportar o que foi alterado, o que foi testado e o que ficou por validar.

---

## 16. Limites desta especificação

Este documento não define:
- A lista definitiva de campos de cada formulário.
- Obrigatoriedade, formato ou validação funcional de cada campo.
- Categorias, contas, cartões, faturas ou opções de negócio concretas.
- Regras de saldo, pagamentos, transferências, reversões ou projeções.
- Permissões e disponibilidade de ações por estado.
- Contratos, payloads, endpoints ou integração de API.
- Persistência, drafts, sincronização ou comportamento do backend.
- Dimensões exatas, breakpoints novos ou implementação interna de componentes.

Esses pontos devem ser obtidos na documentação funcional aprovada e no código existente. Se houver conflito ou ausência de informação, assinalar antes de implementar.

**Resultado esperado:** formulários visualmente consistentes, responsivos e fiéis às decisões aprovadas, sem invenção de requisitos funcionais ou alterações fora do âmbito.
