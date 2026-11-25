# 04 — Interfaces e navegação

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
- A criação é iniciada pelo botão flutuante global (+), contextual à página. No Dashboard oferece Despesa, Receita e Transferência; não existem cartões de ações rápidas separados no conteúdo do Dashboard.
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
- A aba Programações mostra as regras recorrentes, com natureza, valor, periodicidade, conta, categoria, estado e a data da primeira ocorrência; a próxima ocorrência é consultada através das ocorrências reais.
- As ocorrências de uma programação são consultadas numa área de detalhe própria; uma ocorrência materializada também aparece em Movimentos como operação única, sem duplicação.
- A edição e as ações sobre programações/ocorrências usam botões dedicados e não permitem edição inline.

## Rota Financeira — aprovado
- Visão mensal com uma linha por dia, incluindo dias sem movimentos.
- Seletor mensal e navegação anterior/seguinte.
- Cabeçalho com saldo projetado no fim do mês.
- KPIs apenas Entradas e Saídas; sem KPI de saldo inicial.
- Tabela: Dia, Entradas, Saídas, Saldo.
- Dias futuros mostram projeção; sem gráfico e sem distinção inicial entre saídas fixas/variáveis.
- Entradas e saídas neutras; saídas com sinal negativo.
- Cor só na célula/valor Saldo, nunca na linha:
  - Verde: confortável; despesas fixas e variáveis estimadas cobertas.
  - Azul: protegido; fixas cobertas, variáveis estimadas ainda não.
  - Amarelo: atenção; saldo positivo, mas insuficiente para fixas pendentes.
  - Vermelho: risco; saldo projetado negativo ou obrigação essencial sem cobertura.
- Sem badges, legendas ou etiquetas coloridas.
- Saldo projetado final recebe cor apenas quando negativo.
- Exemplos numéricos devem ser matematicamente coerentes.

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


## Navegação e criação — implementação remota em 2026-11-25

Esta secção regista o comportamento atualmente implementado no frontend, após o PR #5. É um registo de implementação, não altera os requisitos financeiros nem autoriza fluxos de escrita ainda sem contrato.

- Bottom bar fixa em mobile/tablet em todas as páginas: Início, Movimentos, Rota, Contas e Mais.
- Painel Mais fixo e consistente: Cartões, Dívidas, Relatórios e Configurações; fecha por seleção, novo toque em Mais ou toque fora.
- Sidebar desktop com páginas agrupadas em Principal, Gestão financeira e Ferramentas; Mais não aparece na sidebar.
- FAB global (+) contextual: Dashboard/Movimentos oferecem despesa, receita e transferência; Contas oferece Nova conta; Cartões oferece Novo cartão; Dívidas oferece Nova dívida; Movimentos/Programações oferece Nova programação; Rota oferece Nova projeção, ainda indisponível por falta de contrato/read model; Relatórios e Configurações não mostram FAB.
- Ações de criação sem formulário/contrato apenas informam indisponibilidade; não criam registos fictícios.
- Rota, Dívidas, Relatórios e Configurações estão acessíveis, mas são placeholders. Contas e Cartões têm interfaces de leitura; as ações de criação permanecem indisponíveis.
- O nome do utilizador é apresentado no perfil da sidebar, sem email. O Dashboard mobile não mantém um menu Mais próprio.


## Rota Financeira — implementação frontend inicial (2026-11-25)

- A página frontend substitui o placeholder e está ligada à navegação desktop e mobile.
- Seletor mensal anterior/seguinte, KPI de Entradas e Saídas e tabela diária com as quatro colunas aprovadas: Data, Entrada, Saída e Saldo.
- A tabela apresenta todos os dias do mês; o switch **Só dias com movimento** filtra para dias com operações realizadas elegíveis.
- Selecionar a data abre modal de detalhe com filtros numa linha e nesta ordem: Todos, Receitas, G. fixos, G. variáveis.
- A lista usa operações realizadas de receita/despesa disponíveis no read model; transferências e estados não realizados são excluídos dos totais apresentados.
- **Limitação explícita:** o frontend atual não calcula saldo diário nem projeção final. A célula Saldo e o saldo projetado mostram indisponibilidade, sem inventar valores. Os filtros G. fixos/variáveis informam que a classificação ainda não existe no contrato de leitura.
- Esta entrega é uma implementação parcial da interface, não conclusão da Rota Financeira nem alteração das regras financeiras aprovadas.


## Regra de implementação frontend
As especificações desta documentação definem comportamento e apresentação, não a estrutura do código. A implementação deve respeitar o padrão frontend em [05 — Arquitetura e UML](05-arquitetura-e-uml.md#frontend-web). Não reproduzir no código a estrutura monolítica de um protótipo HTML de referência.

## Rota Financeira — organização frontend (correção de arquitetura, 2026-11-25)
