# 03 — Interface e formulários

> Documento consolidado. Cada tema tem aqui a sua fonte principal; não criar documentos separados para páginas, casos ou etapas individuais.

---

Regista decisões aprovadas das páginas principais. Não substitui os mockups visuais originais. Não inventar pormenores visuais não especificados nem redesenhar páginas aprovadas sem autorização.

## Princípios e navegação
- Mobile first; desktop complementar.
- Listas compactas, hierarquia clara e sem informação repetida.
- Ações indisponíveis não devem ser apresentadas como ações executáveis. Quando a navegação ou ação já estiver aprovada mas depender de contrato/formulário, manter o acesso contextual e comunicar a indisponibilidade sem criar dados fictícios.
- Projeções apenas na Rota Financeira.
- Navegação inferior fixa em todas as páginas mobile/tablet: Início, Movimentos, Rota, Contas e Mais.
- Mais existe apenas na bottom bar; abre um painel inferior integrado com Cartões, Dívidas, Relatórios e Configurações, sempre nesta ordem.
- O painel Mais não inclui perfil, notificações, logout nem opções dependentes da página. Fecha ao selecionar uma página, tocar novamente em Mais ou tocar fora.
- No desktop, a sidebar contém todas as páginas agrupadas em Principal, Gestão financeira e Ferramentas; Mais não é item da sidebar.

## Dashboard — aprovado
- Saudação dinâmica Bom dia/Boa tarde/Boa noite com primeiro nome.
- Data resumida (ex.: Seg, 23 Nov); ícones de notificações e perfil.
- Seletor mensal compacto (ex.: Nov/26).
- Saldo total atual de todas as contas.
- KPIs de receitas e despesas do mês.
- A criação de operações começa no FAB global (+). No Dashboard, Movimentos e Rota Financeira apresenta sempre as mesmas três opções: **Novo gasto**, **Novo rendimento** e **Nova transferência**. Não existem cartões de ações rápidas separados no conteúdo do Dashboard.
- Últimos movimentos e navegação inferior.
- Sem projeções.
- Seletor mensal filtra receitas, despesas e atividade histórica, mas não altera saldo atual.

## Movimentos — aprovado
- Abas Movimentos e Programações; seletor mensal compacto.
- Em Movimentos, apresentar três KPIs compactos do mês selecionado: Receitas, Despesas e Resultado (Receitas − Despesas).
- Os KPIs de Movimentos consideram apenas operações realizadas, excluem canceladas, pendentes e transferências, e não substituem o saldo atual do Dashboard.
- Lista única, uma linha por operação.
- Filtros horizontais: Todos, Pendentes, Realizados, Cancelados; acessos a Filtros e ordenação/Recentes.
- Pesquisa e filtros por tipo, estado, período, conta e categoria.
- Linha 1: nome à esquerda, valor à direita.
- Linha 2: categoria à esquerda, conta à direita, abaixo do valor.
- Estado compacto abaixo quando necessário.
- Parcial aparece apenas como badge, sem valores detalhados na lista.
- O botão flutuante global (+) é o ponto de entrada para ações de criação na página; não duplicar botão de criação no cabeçalho ou dentro da lista.
- Operação com vários lançamentos não pode aparecer duplicada; detalhes completos na vista/modal de detalhes.
- Cada movimento tem menu contextual `⋮` com ações permitidas pelo tipo e estado, conforme a secção 14.2.
- Em compras parceladas, a linha mostra apenas o valor da prestação correspondente ao período; o valor total da compra fica oculto na listagem e só aparece ao abrir o detalhe. A indicação de prestações pagas é secundária e discreta.
- A aba Programações mostra as regras recorrentes, com natureza, valor, periodicidade, conta, categoria, estado e a data da primeira ocorrência; a próxima ocorrência é consultada através das ocorrências reais.
- As ocorrências de uma programação são consultadas numa área de detalhe própria; uma ocorrência materializada também aparece em Movimentos como operação única, sem duplicação.
- A edição e as ações sobre programações/ocorrências usam botões dedicados e não permitem edição inline.

## Rota Financeira — aprovado
- Desktop: mostrar pelo menos três meses consecutivos lado a lado; navegação anterior/seguinte desloca o período um mês.
- Cada mês apresenta título, totais de entradas/saídas, indicação do saldo final e tabela diária.
- Mobile: mostrar um mês de cada vez, com navegação mensal, resumo do mês, switch **Só dias com movimento** e tabela adaptada à largura. A lista cresce com a página (sem scroll interno) e termina junto da área reservada à bottom bar; o FAB global fica fixo no viewport e sobrepõe a lista.
- Cabeçalho mobile segue o padrão de Movimentos: título alinhado à esquerda e seletor mensal partilhado alinhado à direita; ocultar subtítulo neste breakpoint.
- Tabela diária: Dia, Entradas, Saídas, Saldo; incluir todos os dias do mês quando o switch está desligado.
- O switch ligado mostra apenas dias com movimentos realizados elegíveis.
- Selecionar a data abre modal de detalhe; filtros numa linha e nesta ordem: Todos, Receitas, G. fixos, G. variáveis.
- KPIs/totais apenas Entradas e Saídas; sem KPI de saldo inicial.
- Sem gráfico e sem distinção fixa/variável na tabela principal.
- Entradas e saídas realizadas são agregadas; transferências não alteram esses totais, mas aparecem no detalhe diário como operação neutra. Estados não realizados não entram na tabela nem nos totais.
- Saldo diário e saldo final/projeção só são apresentados quando o contrato financeiro fornecer valores válidos. Até lá, indicar indisponibilidade, sem inventar números.
- Cor só na célula/valor Saldo quando houver cálculo fiável, nunca na linha. Sem badges, legendas ou etiquetas coloridas.
- Saldo projetado final recebe cor apenas quando negativo.
- O FAB global é o único ponto de criação; não adicionar botão + local.

## Contas — aprovado
- Cabeçalho Contas sem botão + local; a ação Nova conta é apresentada pelo botão flutuante global (+), contextual à página.
- Card/KPI Saldo total imediatamente abaixo do cabeçalho, antes dos filtros e da lista.
- Filtro de contas ativas/encerradas.
- Secção **As minhas contas**, apresentada acima da lista.
- Linha: ícone, nome, instituição/descrição abaixo, saldo atual calculado à direita e menu contextual `⋮`.
- O menu contextual de cada conta inclui o acesso **Conferir saldo**. Não existe acesso global de conferência no fim da página.
- A conferência abre a subpágina da conta selecionada: comparar saldo calculado e saldo real informado; mostrar diferença e histórico; registar comparação/data sem criar movimentos nem alterar saldo calculado.
- O saldo atual inclui o saldo inicial da conta e todos os lançamentos realizados válidos posteriores; pendentes e projeções não entram.
- Na criação, o utilizador informa o saldo existente no início da utilização da conta no Orbe. Esse valor é posição de abertura, não receita/despesa nem KPI separado.
- O saldo inicial não pode ser sobrescrito no modal de edição; correções exigem ação rastreável própria, conforme regras financeiras.

## Cartões — aprovado
Reutiliza estrutura de Contas.
- Cabeçalho Cartões sem botão + local; a ação Novo cartão é apresentada pelo botão flutuante global (+), contextual à página.
- KPI TOTAL EM DÍVIDA e número de cartões.
- Secção Os meus cartões.
- Cada cartão: ícone/nome/chevron; Utilizado e Limite total; barra de utilização; Disponível e percentagem utilizada; linha discreta com fecho e vencimento.
- Fatura só aparece ao entrar no cartão.
- Não mostrar banco nem últimos dígitos.

## Dívidas — aprovado
Reutiliza estrutura de Contas e Cartões.
- KPI TOTAL EM ABERTO.
- Número de dívidas ativas e total de prestações mensais.
- Lista As minhas dívidas.
- Item: ícone, nome, tipo/descrição, valor em aberto, prestação mensal, barra de liquidação e valor liquidado.
- Toque abre detalhes.

## Relatórios — aprovado
- Cabeçalho Relatórios e seletor mês/ano.
- KPIs Receitas e Despesas; resultado do mês.
- Visualização simples da composição receitas/despesas.
- Análise financeira: evolução mensal; despesas por categoria; atividade por conta; compras/faturas/pagamentos de cartões; pagamentos/evolução das dívidas.
- Apenas operações realizadas; sem projeções.

## Configurações — aprovado
- Preferências: Perfil, Moeda, Categorias, Aparência e preferências.
- Segurança e Dados: Segurança, Dados e cópias de segurança.
- Sobre o Orbe.
- Não editar movimentos, contas, cartões ou dívidas diretamente nesta página.

## Ordem de desenho aprovada
Concluir páginas principais; desenhar subpáginas; definir modais; auditar consistência e reaproveitamento.

## Regra de implementação frontend
As especificações desta documentação definem comportamento e apresentação, não a estrutura do código. A implementação deve respeitar o padrão frontend em [04 — Arquitetura, modelo e auditoria](04-arquitetura-modelo-e-auditoria.md#frontend-web). Não reproduzir no código a estrutura monolítica de um protótipo HTML de referência.

## Rota Financeira — organização frontend (correção de arquitetura, 2026-11-25)

---

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
- Os formulários não devem criar um FAB próprio nem duplicar o ponto de entrada de criação da aplicação. O FAB global pertence ao `AppShell`. Em Dashboard, Movimentos e Rota Financeira mantém as três opções fixas (Novo gasto, Novo rendimento e Nova transferência); nas páginas de gestão de entidades, as ações próprias permanecem no contexto aprovado da página. O formulário só abre quando a ação e o contrato estão disponíveis.
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

### 6.1 Gasto (natureza técnica: `EXPENSE`)

**Recipiente:** modal centralizado em desktop/tablet; bottom sheet em mobile, salvo se o formulário for classificado como extenso pela especificação funcional.

**Composição:**
1. Título de interface **Novo gasto**.
2. Campo de valor em destaque, correspondente ao valor total do gasto.
3. Campos funcionais do gasto, com etiquetas superiores e contorno.
4. Seletor de categoria em lista simples com ícones.
5. Campo de meio de pagamento/liquidação, que determina os efeitos financeiros da operação conforme o contrato: conta (pagamento imediato), cartão/fatura, por pagar (obrigação) ou prestações. A obrigação, quando aplicável, deriva do gasto; não se cria uma segunda despesa nem se exige uma ação genérica paralela **Nova dívida**.
6. Controlo de data com atalhos rápidos.
7. Rodapé fixo com ação secundária e ação principal.

**Regras visuais e de apresentação:**
- Valor total do gasto é o primeiro foco visual no formulário.
- Campos restantes devem ter hierarquia mais discreta.
- Não transformar cada campo num cartão independente.
- A ordem funcional definitiva dos campos deve ser respeitada; não inventar campos adicionais.
- Na listagem mensal, uma compra parcelada mostra apenas o valor da prestação do período. O valor total fica oculto até abrir o detalhe; a indicação de prestações pagas é secundária e discreta.
- O pagamento posterior de fatura/obrigação é uma liquidação, não um novo gasto.

Wireframe conceptual:

```text
Novo gasto                             [X]
Valor total
┌──────────────────────────────────────┐
│ €                         0,00       │
└──────────────────────────────────────┘
[Campos definidos pela especificação funcional]
Categoria
[Lista simples com ícones]
Meio de pagamento
[Conta / Cartão / Por pagar / Prestações]
Data
[Hoje] [Ontem] [Escolher data]
────────────────────────────────────────
[Cancelar]                 [Guardar]
```

**Limite funcional:** esta composição aprova a intenção de interface, não cria endpoints nem fecha todos os campos/regras de obrigações genéricas, financiamento, pagamento parcial ou seleção antecipada em operações pendentes. Estes continuam sujeitos aos contratos financeiros/API.

### 6.2 Receita

**Estrutura:** igual à despesa.

- Reutilizar a hierarquia, o espaçamento, o tipo de campos e o recipiente.
- A receita mantém a mesma identidade visual geral.
- Distinguir a natureza da operação com tratamento visual coerente, por exemplo na cor do valor, sem criar um segundo design system.
- Não usar uma cor diferente em todos os elementos indiscriminadamente.
- Se a receita usar categorias ou campos diferentes por regra funcional, respeitar essa diferença sem alterar a estrutura visual comum.
- Quando já recebida, representar a conta onde o valor entrou; quando prevista/pendente, não apresentar a seleção da conta como obrigatória nem assumir que fica associada na criação. O momento de associação da conta em receitas pendentes continua por decidir.

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
- Na criação, incluir o campo funcional **Saldo inicial** conforme `docs/02-regras-financeiras.md`: valor existente no início da utilização da conta no Orbe; não é receita/despesa.
- Na edição, não permitir sobrescrever o saldo inicial ou o efeito financeiro de abertura. A abertura original deve ser preservada; correção exige fluxo rastreável definido pela especificação funcional.
- Não criar pré-visualização decorativa de conta.
- Não acrescentar campos não definidos funcionalmente.

**Regra funcional associada:** saldo inicial zero não gera lançamento; saldo inicial não zero gera uma única operação de abertura com efeito realizado na conta, confirmada atomicamente com a criação. O campo não deve ser confundido com o saldo atual, que é derivado dos lançamentos válidos.

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

**Decisão aprovada: FAB global para criação de operações.**

- Nas páginas Dashboard, Movimentos e Rota Financeira, o FAB global (+) apresenta sempre as mesmas opções, pela mesma ordem: **Novo gasto**, **Novo rendimento**, **Nova transferência**.
- O contexto da página não altera nem substitui estas três opções. A Rota Financeira é uma vista temporal dos mesmos dados, não um módulo separado de criação.
- As ações de gestão de entidades (por exemplo, criar conta ou cartão) permanecem no contexto da respetiva página, conforme a navegação aprovada.
- Não duplicar o ponto de entrada de criação no cabeçalho, lista ou formulário.
- Não expor ações indisponíveis como executáveis; a existência de uma opção não confirma que o formulário/contrato esteja implementado.
- O FAB e a navegação global são definidos no `AppShell`; os formulários não criam FAB próprio.

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
| Abertura | FAB global nas páginas principais de operações; ações de entidade no contexto próprio |
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
- [ ] O FAB global apresenta as mesmas três opções em Dashboard, Movimentos e Rota Financeira; não existem botões de criação duplicados no cabeçalho/lista.
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

## 14.1 Entrada global de criação e estado atual da aplicação

A navegação publicada na `main` em 2026-11-25 utiliza um FAB global (+), fixo no viewport. A regra abaixo consolida e substitui descrições anteriores de FAB contextual nas páginas principais de operações. Não criar FAB próprio dentro de formulários nem duplicar criação no cabeçalho/lista.

- Dashboard, Movimentos e Rota Financeira: opções fixas e na mesma ordem — **Novo gasto**, **Novo rendimento**, **Nova transferência**. A Rota é uma vista temporal dos mesmos dados, não um módulo separado.
- **Gasto** é o termo de interface; `EXPENSE`/despesa mantém-se como natureza/tipo técnico e financeiro. O gasto descreve o consumo/compra; o meio de pagamento determina os efeitos (conta, fatura/cartão ou obrigação por pagar) conforme os contratos financeiros.
- Uma obrigação criada como consequência de um gasto não é uma ação paralela genérica no FAB. O gasto é o ponto de entrada; a obrigação é um efeito financeiro da operação quando aplicável.
- Movimentos/Programações: a recorrência é configurada dentro do fluxo de Novo gasto ou Novo rendimento; não existe uma opção adicional **Nova programação** no conjunto fixo do FAB.
- Contas: a ação **Nova conta** permanece no contexto da página; formulário ainda indisponível.
- Cartões: a ação **Novo cartão** permanece no contexto da página; formulário ainda indisponível.
- Dívidas: não apresentar **Nova dívida** como opção genérica de criação. A gestão/consulta de obrigações mantém-se; a criação de financiamento/entrada de empréstimo ou registo de dívida preexistente exige um fluxo específico, ainda por definir. Esta nota não decide se Dívidas permanece página principal.
- Não apresentar **Nova projeção** no FAB. Projeções são calculadas na Rota, não criadas como operações financeiras.
- Relatórios e Configurações: FAB oculto quando não existe ação de criação aprovada.

A presença de uma opção não confirma que o formulário ou contrato esteja implementado. Ações sem suporte devem comunicar indisponibilidade e não criar dados fictícios.

## 14.2 Menu contextual dos movimentos (`⋮`) — aprovado

O toque na linha abre o detalhe do movimento. O menu `⋮` é um ponto de ação separado, curto e previsível; não substitui o detalhe e não deve repetir a ação de abrir o movimento.

**Ordem e agrupamento:**
1. **Editar movimento** — apenas quando a edição é permitida para o tipo e estado.
2. **Duplicar movimento** — prepara um novo registo com os dados copiados; não duplica efeitos financeiros nem guarda/confirma automaticamente.
3. **Ação de estado** — uma ação principal adequada ao estado e natureza (por exemplo, confirmar gasto pendente, registar recebimento ou cancelar uma ocorrência futura), apenas quando suportada pelo contrato.
4. **Ações específicas do tipo**, quando aplicáveis:
   - Compra parcelada: **Ver plano de prestações**; **Gerir prestações** quando o fluxo estiver implementado.
   - Fatura do cartão: **Ver movimentos incluídos**; **Registar pagamento** quando o contrato de pagamento estiver disponível.
   - Programação/ocorrência: **Editar recorrência** ou **Suspender recorrência** apenas no contexto e estado permitidos pelo contrato.
5. Separador.
6. **Eliminar** apenas registos não realizados e elegíveis para eliminação; para operações realizadas, usar **Estornar**, nunca apagar o histórico.

**Regras de estado e integridade:**
- Mostrar apenas ações válidas para aquele movimento; ocultar ações indisponíveis, não as apresentar desativadas como decoração.
- Operação realizada mantém histórico. Estorno cria operação/efeitos compensatórios ligados à origem, com confirmação que identifica o movimento original; não altera nem elimina lançamentos confirmados.
- Cancelamento é distinto de estorno e só se aplica a estados/ocorrências canceláveis antes da realização.
- Ações de pagamento/liquidação não podem criar uma segunda despesa: liquidam a obrigação associada e geram os efeitos financeiros definidos no contrato.
- Uma operação materializada a partir de recorrência aparece uma única vez em Movimentos; a gestão da programação/ocorrência mantém o seu contexto próprio.
- Desktop/tablet: menu ancorado ao movimento. Mobile: bottom sheet. Reutilizar o padrão de menu contextual existente.

A composição do menu está aprovada como decisão de interface. Permissões, transições, endpoints e implementação de cada ação continuam subordinados aos contratos de domínio/API; esta secção não autoriza novas regras financeiras nem endpoints.

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

---

## 17. Correspondência obrigatória com as regras funcionais

Esta secção confronta os padrões visuais anteriores com as regras de `docs/02-regras-financeiras.md`, `docs/01-produto-e-funcionalidades.md`, `docs/03-interface-e-formularios.md`, `docs/05-estado-e-plano.md` e `docs/04-arquitetura-modelo-e-auditoria.md`.

**Hierarquia documental:** as regras funcionais e o modelo de domínio prevalecem sobre qualquer wireframe deste ficheiro. Esta especificação apenas determina como apresentar e interagir com os fluxos já definidos. Um exemplo visual não cria um campo, método de pagamento, estado, associação ou ação nova.

### 17.1 Princípios transversais que todos os formulários têm de respeitar

- A operação representa o acontecimento de negócio; os lançamentos representam os efeitos financeiros. Uma operação pode originar vários lançamentos, mas deve continuar a ser apresentada como uma única operação na interface.
- Um lançamento tem exatamente um destino: conta, fatura ou dívida. Não apresentar um único lançamento como se afetasse simultaneamente vários destinos.
- Apenas efeitos realizados válidos dirigidos a contas alteram saldos efetivos. Operações pendentes, planos e projeções não alteram saldos.
- Uma data prevista, por si só, nunca confirma pagamento ou recebimento.
- O estado inicial decorre dos dados e da natureza do evento. Não disponibilizar um seletor de estado livre que permita combinações incoerentes.
- A confirmação de pagamento/recebimento tem de ser explícita e idempotente. A interface deve impedir submissões repetidas enquanto a ação está em curso e apresentar o resultado sem sugerir duplicação.
- As ações de editar, confirmar, cancelar, eliminar e reverter são distintas. Mostrar apenas as ações permitidas pelo estado, natureza e dependências.
- Eliminar só é permitido quando não existem efeitos confirmados nem dependências impeditivas. Quando há efeitos confirmados, a correção é rastreável; a ação é **Reverter**, não apagar ou editar silenciosamente.
- Cancelar preserva o registo, motivo e data, não altera saldo efetivo e retira a operação da projeção.
- Mensagens, resumos e confirmações devem descrever apenas efeitos comprovados pelo domínio; não prometer alterações de saldo para operações pendentes.

### 17.2 Despesa: conta ou cartão de crédito

A interface deve distinguir o instrumento utilizado e o efeito financeiro correspondente, sem tratar ambos como o mesmo fluxo:

**Despesa realizada paga por conta**
- Apresentar a seleção da conta que recebeu o efeito financeiro.
- O formulário e o resumo devem deixar claro que a operação foi realizada e que o lançamento efetivo afeta essa conta.
- Não criar uma segunda seleção genérica de “método de pagamento” se a documentação não definir essa taxonomia.

**Compra realizada com cartão de crédito**
- Apresentar a seleção do cartão de crédito, não uma conta bancária como origem da compra.
- Na confirmação da compra, reconhecer a despesa uma única vez na data da compra e reconhecer a obrigação na(s) fatura(s)/período(s) correspondente(s).
- Não apresentar uma saída imediata de conta bancária nem reduzir o saldo da conta por causa da compra.
- Compra parcelada: a confirmação reconhece o valor total da despesa uma única vez e cria as alocações/obrigações dos períodos correspondentes na mesma confirmação. Períodos `PLANNED` podem já conter obrigações efetivas; abrir o ciclo não cria novos lançamentos.
- A interface não deve sugerir que cada parcela é uma nova despesa.
- A atribuição ao ciclo de uma compra realizada exatamente no dia do fecho continua pendente de decisão de produto.

**Despesa pendente**
- Mostrar claramente que está pendente e que a data é prevista.
- Não aumentar saldo de conta nem reconhecer como realizado antes da confirmação.
- A documentação não decide se conta/cartão é associado já na criação ou apenas no momento da confirmação. Não impor uma destas opções nem tornar o campo obrigatório até essa decisão ser fechada.
- Na confirmação, recolher os dados necessários para criar os efeitos efetivos permitidos. O detalhe exato depende da decisão pendente sobre associação antecipada.

### 17.3 Receita recebida ou prevista

**Receita recebida**
- A confirmação explícita representa recebimento realizado.
- Apresentar a conta onde o valor entrou e o efeito de entrada nessa conta.
- A receita é reconhecida uma vez; não criar entradas duplicadas por causa de vários detalhes de apresentação.

**Receita prevista/pendente**
- Mostrar estado pendente e data prevista.
- Não aumentar o saldo efetivo da conta.
- A associação antecipada a uma conta, ou a seleção apenas no momento da confirmação, não está definida nos documentos. Não escolher silenciosamente uma alternativa.
- A confirmação do recebimento deve ser uma ação explícita.

**Recebimentos parciais:** as regras aprovadas detalham pagamentos parciais de obrigações, mas não fecham suficientemente o fluxo de recebimentos parciais de receitas. Não inventar um fluxo, alocação ou conjunto de ações.

### 17.4 Transferência entre contas

- A interface representa uma única operação com duas pernas associadas: saída (`OUT`) e entrada (`IN`).
- Exibir claramente conta de origem e conta de destino, sem permitir confusão entre os seletores.
- O valor e a associação entre as pernas têm de ser coerentes.
- Cada perna tem data prevista/efetiva e estado próprios; não assumir que ambas são realizadas ou canceladas em simultâneo.
- O estado global é derivado das duas pernas. Combinações parcialmente realizadas devem ser apresentadas como parciais, não como transferência integralmente concluída.
- Se uma perna estiver realizada e a outra pendente, a interface deve preservar o efeito realizado e identificar a parte ainda não correspondida. Não oferecer cancelamento/eliminação que apague o efeito já realizado.
- A transferência não é receita nem despesa e não deve ser apresentada como tal.
- A especificação visual não cria um fluxo de reversão independente por perna; exceções de liquidação exigem ação corretiva explícita conforme o domínio.

### 17.5 Pagamento de fatura de cartão

- Uma única operação na interface pode pagar uma ou várias faturas.
- Apresentar as faturas abrangidas e a alocação por fatura, com valores legíveis e verificáveis; não reduzir a operação a uma seleção de uma única fatura.
- Apresentar a conta de origem do pagamento.
- Antes da confirmação, mostrar resumo com saída total da conta e redução atribuída a cada fatura.
- A soma das reduções tem de corresponder à saída total. Cada redução é alocada a obrigações da mesma fatura e não pode exceder o saldo restante dessas obrigações.
- Pagamentos parciais são permitidos. A interface deve permitir representar a liquidação parcial sem apresentar a fatura como totalmente liquidada.
- A confirmação é atómica: saída da conta, reduções por fatura e alocações são confirmadas em conjunto ou não são confirmadas.
- O pagamento de fatura não cria uma segunda despesa.
- Reversões de pagamento mantêm rastreabilidade própria às alocações originais; não reutilizar a alocação original como se fosse a reversão.
- Podem existir várias faturas de ciclos anteriores com obrigações em aberto. Não assumir que só existe uma fatura em dívida porque só pode existir um ciclo `OPEN` por cartão.
- O estado do ciclo (`PLANNED`, `OPEN`, `CLOSED`) não é o estado de pagamento nem o valor em dívida. Não os fundir num único badge ou seletor.
- A regra de apresentação das faturas anteriores com obrigação em aberto continua pendente.

### 17.6 Saldo inicial de cartão

O formulário próprio referido na secção 6.6 deve respeitar o contrato funcional:
- Saldo inicial zero não exige distribuição.
- Saldo inicial positivo exige distribuição integral por faturas/ciclos, e a soma distribuída tem de ser exatamente igual ao valor informado.
- Não pode existir parcela por distribuir.
- Não é compra, despesa, receita nem saída de conta.
- Existe no máximo uma operação original de saldo inicial por cartão.
- A distribuição inicial é histórica e imutável. Correções/redistribuições posteriores são operações corretivas rastreáveis; só podem atingir obrigação ainda não liquidada e não comprometida por correções anteriores.
- A pré-visualização/resumo deve permitir conferir a distribuição integral antes da confirmação, sem criar uma nova natureza de movimento.
- Não inventar a política de crédito negativo de fatura; esse tema continua pendente.

### 17.7 Dívidas e pagamentos parciais

Embora o formulário detalhado de Dívidas ainda dependa do desenho da subpágina, qualquer formulário de pagamento deve respeitar:
- Cada pagamento parcial é uma operação individual ligada à dívida/obrigação.
- Cada pagamento identifica a conta de origem; pagamentos da mesma dívida podem partir de contas diferentes.
- O pagamento cria efeito na conta de origem e redução da obrigação. Não criar uma segunda despesa.
- Reverter um pagamento parcial não reverte os restantes pagamentos.
- O valor em aberto é derivado dos efeitos financeiros válidos, não de um campo editável manualmente.
- Prestações são agenda/afetação da obrigação, não uma segunda dívida.
- A associação explícita de pagamentos a uma ou várias prestações ainda não está fechada. Não assumir FIFO nem inventar um seletor/alocação por prestação.
- Um plano de pagamento é intenção/projeção, não lançamento efetivo. Não altera saldo nem obrigação liquidada.
- Um plano não confirmado até à data prevista passa a vencido; a obrigação permanece em aberto. Sem política aprovada de débito automático/reagendamento, não propor nova data automaticamente.

### 17.8 Recorrências e ocorrências

- A programação e cada ocorrência são conceitos distintos.
- A interface deve distinguir editar a programação de editar uma ocorrência materializada/individual.
- Quando a ação incide numa ocorrência recorrente, as opções funcionais aprovadas são “Apenas esta ocorrência” e “Esta e todas as seguintes”.
- “Apenas esta ocorrência” afeta apenas a selecionada.
- “Esta e todas as seguintes” afeta a selecionada e futuras e atualiza a programação a partir dela.
- Ocorrências passadas/realizadas permanecem preservadas; não as reescrever.
- Cancelar uma ocorrência não cancela a programação inteira.
- Não duplicar ocorrências nem apresentar simultaneamente uma ocorrência e a operação que já a materializou como dois eventos.
- A classificação para estimativas da Rota segue a precedência operação → ocorrência → programação → categoria → não classificada. A interface de formulários não deve alterar esta precedência nem tratar `UNCLASSIFIED` como zero ou variável.
- A especificação visual das opções não autoriza alterar a regra de geração ou persistência das recorrências.

### 17.9 Categorias, classificações e Rota Financeira

- A categoria classifica a natureza da operação e fornece a classificação predefinida para estimativas, mas classificação fixa/variável/excluída não altera a natureza económica, os saldos ou os relatórios.
- `EXCLUDED` significa excluída apenas da estimativa variável; não significa excluída dos movimentos, saldos ou relatórios.
- `UNCLASSIFIED` significa desconhecida; não a representar como zero nem como variável por omissão.
- Transferências, liquidações de fatura/dívida e efeitos técnicos não entram na estimativa variável por natureza.
- Apenas a Rota Financeira apresenta projeções. Formulários e resumos de Movimentos, Dashboard e Relatórios não devem introduzir projeções como se fossem valores realizados.
- O Dashboard mostra saldo atual; não incorporar nele saldo futuro ou pendentes.
- Relatórios consideram operações realizadas, sem projeções.

### 17.10 Conferência de saldos

A conferência é uma comparação, não um movimento:
- Apresentar saldo calculado, saldo real informado, diferença e data da conferência, conforme a funcionalidade aprovada.
- Não apresentar a conferência como despesa, receita, transferência ou ajuste de saldo.
- Não criar lançamento nem alterar o saldo calculado.
- O histórico de conferências pertence à subpágina de Contas, não a um formulário de movimento.

### 17.11 Ações permitidas por estado e dependências

A apresentação dos botões e menus deve obedecer a `docs/01-produto-e-funcionalidades.md` e `docs/03-interface-e-formularios.md`:
- Não mostrar ações indisponíveis. Não mostrar opções desativadas apenas para explicar que não podem ser usadas.
- **Pendente:** pode permitir edição conforme natureza/dependências e confirmação explícita; não assumir que todos os campos continuam editáveis.
- **Realizado:** alterações com efeitos financeiros confirmados exigem correção rastreável. Não disponibilizar eliminação destrutiva; apresentar Reverter apenas quando permitido.
- **Cancelado:** preservar histórico e excluir da projeção; não assumir que pode ser reativado.
- **Parcial:** na lista de Movimentos, mostrar apenas o indicador “Parcial”, sem valores detalhados. O detalhe pode consultar os efeitos relacionados segundo o fluxo funcional aprovado.
- Eliminação, cancelamento e reversão devem ter confirmações contextuais distintas. A confirmação não deve ser usada para contornar dependências impeditivas.
- Menus e ações contextuais só incluem operações permitidas no contexto atual.

### 17.12 Decisões funcionais ainda pendentes — não resolver no desenho

A documentação consultada não permite fechar os pontos seguintes. Permanecem explicitamente pendentes:
1. Associar conta/cartão na criação de operação pendente ou apenas na confirmação, tanto para despesas como para receitas.
2. Taxonomia completa de meios de pagamento e respetiva apresentação. Não inventar opções como dinheiro, débito, transferência ou outras como catálogo fechado.
3. Recebimentos parciais de receitas: criação, associação, conta de destino e reversão.
4. Associação de pagamentos de dívida a prestações específicas; não presumir FIFO.
5. Regra para compras efetuadas no próprio dia do fecho do cartão.
6. Apresentação de faturas de ciclos anteriores que continuam com obrigação em aberto.
7. Política de planos de fatura vencidos: débito automático ou reagendamento.
8. Crédito negativo de fatura, passagem a ciclos seguintes e eventual devolução à conta.
9. Fórmula, janela histórica, distribuição diária e apresentação de estimativas variáveis na Rota.
10. Precisão monetária, escala e arredondamento; a interface não deve fixar casas decimais ou regras de arredondamento por conta própria.
11. Moeda principal e possibilidade de alteração depois de existirem movimentos.
12. Máquinas de estado completas de faturas, planos, dívidas, prestações, ocorrências e exceções de transferências.

Até estas decisões serem aprovadas:
- Não transformar os pontos pendentes em campos obrigatórios, opções, botões, validações ou comportamentos.
- Não usar wireframes como fonte para resolver lacunas.
- Se um fluxo depender de uma decisão pendente, apresentar o diagnóstico e pedir decisão antes de implementar a parte afetada.

### 17.13 Matriz de rastreabilidade documental

| Fluxo/interface | Regras que condicionam o desenho |
|---|---|
| Despesa por conta/cartão | 02 — Receitas, despesas e cartões; 03 — Compra parcelada |
| Receita recebida/pendente | 02 — Realizado, pendente e projetado; 03 — OP-001/002/005 |
| Transferência | 02 — Transferências e contas; 03 — OP-011; 07 — duas pernas e estado global derivado |
| Pagamento de fatura | 02 — Pagamento e alocação; 03 — Regras operacionais de cartões e faturas |
| Saldo inicial de cartão | 02 — Saldo inicial de cartões; 03 — Regras operacionais de saldo inicial |
| Dívidas e pagamentos | 02 — Dívidas e pagamentos; 03 — OP-006/007; 07 — dívida e prestações |
| Recorrências | 02 — Recorrências; 03 — OP-012 a OP-014 |
| Editar/cancelar/eliminar/reverter | 02 — Correções e conferência; 03 — OP-003/004/008/009/010/015 |
| Conferência de saldos | 02 — Correções e conferência; 04 — Contas; 07 — Conferências |
| Dashboard/Movimentos/Rota/Relatórios | 02 — Classificação para estimativas; 04 — Páginas aprovadas; 07 — objetivos das páginas |

