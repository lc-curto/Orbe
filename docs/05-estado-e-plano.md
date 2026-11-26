# 05 — Estado e plano

> Documento único de acompanhamento. O estado atual, pendências, sequência de execução e validações ficam juntos; não manter cronogramas paralelos.

---

Registo central do que falta decidir ou especificar. Uma decisão só passa a aprovada após confirmação explícita.

## Estado das etapas
| Etapa | Estado |
|---|---|
| 1. Fundamentos do produto | Aprovada |
| 2. Modelo financeiro e regras | Aprovada |
| 3. Comportamento das operações | Aprovada |
| 4. Páginas principais | Aprovada |
| 5. Stack principal | Aprovada |
| 6. Organização do repositório | Aprovada |
| 7. Decisão ARC-001 — destino dos lançamentos | Aprovada |
| 8. Modelo ER conceptual (ARC-002) | Aprovada como especificação de domínio |
| 9. UML complementar e modelo físico do núcleo financeiro | Aprovados; extensões futuras permanecem delimitadas |
| 10. Validação final e plano de implementação | Por fazer |

## Stack tecnológica e organização aprovadas
- Backend: Laravel 13 + PHP.
- Base de dados: MySQL 8.4 LTS.
- Web: React + TypeScript + Vite.
- Mobile: React Native + Expo + TypeScript (Android e iOS).
- Comunicação: API REST/JSON comum.
- Organização: monorepo único com `backend/`, `web/`, `mobile/` e `docs/`, além de `README.md` e `AGENTS.md` na raiz.
- Cada aplicação mantém dependências, configuração e execução próprias.
- Não adotar ferramenta de orquestração de monorepo nesta fase.

## Decisões técnicas pendentes
| ID | Decisão | Estado |
|---|---|---|
| ARC-002 | Modelo ER conceptual consolidado | Aprovado como especificação de domínio |
| ARC-003 | Representação monetária, escala e arredondamento | Aprovado para o núcleo financeiro: `DECIMAL(19,4)`, aritmética decimal exata e apresentação half-up a duas casas |
| ARC-004 | Autenticação e sessões | Pendente |
| ARC-006 | Alojamento, deploy e ambientes | Pendente |
| ARC-007 | Scheduler, filas e processamento assíncrono | Em análise |
| ARC-008 | Testes, CI/CD, backup e recuperação | Pendente |

## ARC-001 — decisão aprovada
**Alternativa A: referências específicas.** Cada lançamento terá exatamente um destino, referenciado por uma FK específica para conta, fatura ou dívida/obrigação. A regra de destino único deverá ser protegida por `CHECK` constraint e testes. A decisão não fecha ainda todos os detalhes do modelo físico.

A comparação e a fundamentação estão documentadas em [05 — Arquitetura e UML](04-arquitetura-modelo-e-auditoria.md), secção ARC-001.

## ARC-002 — proposta de modelo ER
Foi criado [07 — Modelo ER](04-arquitetura-modelo-e-auditoria.md), que contém:
- Diagrama ER conceptual.
- Entidades e responsabilidades.
- Relações de operações, lançamentos, contas, cartões/faturas, dívidas/prestações, transferências, recorrências e conferências.
- Regras de integridade propostas.
- Contratos de leitura das páginas, com foco na diferença entre Dashboard, Movimentos e Rota Financeira.
- Pontos que ainda precisam de decisão antes do modelo físico.

**Estado: APROVADO.** O modelo ER conceptual foi aprovado como especificação de domínio, incluindo saldo inicial integralmente distribuído por faturas, distribuições históricas, correções, rastreabilidade de reversões e pagamentos multi-fatura. Esta aprovação não aprova o modelo físico nem autoriza migrations.

## Decisões de produto ainda pendentes
Estas decisões não reabrem o núcleo financeiro; devem ser aprovadas antes de especificar os comportamentos finais correspondentes.

| Tema | Decisão pendente |
|---|---|
| Planos de fatura vencidos | Se existe débito automático ou reagendamento automático após o vencimento; sem aprovação, não inventar nova data. |
| Faturas anteriores | Como apresentar faturas de ciclos anteriores que continuam com obrigação em aberto. |
| Compra no dia do fecho | Regra de atribuição ao ciclo quando a compra ocorre na data de fecho. |
| Crédito negativo de fatura | Se é permitido, como transita para ciclos seguintes e em que condições pode ser devolvido à conta. |
| Estimativa variável da Rota | Categorias iniciais, janela histórica, fórmula, distribuição diária e comunicação de dados `UNCLASSIFIED`. |
| Moeda e precisão | Escala, arredondamento e se a moeda principal pode mudar depois de existirem movimentos. |
| Saldo inicial de conta | **Decidido:** informar o saldo existente ao iniciar a utilização da conta no Orbe; registar como abertura, não como receita/despesa. |

**Contrato de saldo inicial de cartão definido:** saldo inicial positivo é integralmente distribuído por faturas; não existe parcela por distribuir, obrigação especial em dívidas ou novo destino financeiro. A operação original é única por cartão. Distribuições históricas são imutáveis; correções e reversões são rastreáveis. A obrigação em aberto deriva exclusivamente de `financial_entries`.

**Contrato de saldo inicial de conta definido:** ao criar uma conta, informar o saldo existente no início da utilização no Orbe. O valor é reconhecido por operação `ACCOUNT_OPENING_BALANCE` e lançamento realizado dirigido à conta; não é receita/despesa. Saldo zero não gera lançamento; saldo negativo só é permitido quando compatível com o tipo de conta. Existe uma única abertura original por conta, não editável diretamente; correções preservam a origem e são rastreáveis. O saldo atual deriva dos lançamentos válidos.

## Trabalho funcional pendente
- Contas, Cartões/faturas e Rota Financeira: páginas primárias implementadas; utilizador confirmou QA local do `AppShell` e das páginas principais. Os contratos de saldos/projeções e os formulários de escrita continuam pendentes.
- Dívidas: não haverá página principal autónoma. A implementação visual de Dívidas na branch `feature/debts-primary-page` fica obsoleta e não deve ser integrada; obrigações permanecem no modelo financeiro e serão consultadas/geridas a partir dos movimentos/faturas relacionados, conforme os contratos. Nenhum valor ou dívida é simulado.
- Definir subpáginas e modais das páginas primárias, sem inventar campos ou regras funcionais.
- Auditar/refatorar gradualmente páginas existentes com problemas de arquitetura React, começando por Movimentos e responsabilidades excessivas em `App.tsx`; não fazer refatoração global nem bloquear páginas primárias.
- Definir validações e ações por estado/dependência quando os contratos forem tratados.

Ordem de execução: concluir e validar as páginas de leitura ainda necessárias; desenhar os detalhes/modais dos movimentos e faturas; fazer auditoria/refatoração frontend direcionada; fechar read models/contratos financeiros e implementar os formulários suportados.

## Estado da implementação frontend — 2026-11-26

- PR #3: página Contas em modo de leitura publicada na `main`.
- PR #4: página Cartões e detalhe de faturas em modo de leitura publicados na `main`.
- PR #5: navegação responsiva, painel Mais e FAB global contextual publicados na `main` (merge commit `6b6efea51122de0d648ece393d7cc2e6a82e0f73`).
- Movimentos/Programações: leitura implementada; os formulários de programação continuam indisponíveis.
- Rota Financeira: interface trimestral desktop e mensal mobile publicada na `main`; dados realizados agregados a partir do read model atual. O utilizador confirmou QA local das páginas principais. Saldo diário/final, projeção e classificação fixa/variável continuam indisponíveis; build/lint devem ser reexecutados após alterações futuras.
- As ações Nova conta e Novo cartão permanecem no contexto das respetivas páginas e comunicam indisponibilidade enquanto faltarem formulários/contratos. O FAB das páginas Dashboard, Movimentos e Rota Financeira não oferece Nova dívida, Nova programação ou Nova projeção: recorrência configura-se no fluxo de gasto/rendimento; projeções são calculadas; criação de financiamento ou dívida preexistente exige fluxo específico ainda por definir.
- Regra aprovada para gasto/ganho: pendente não apresenta nem exige conta, cartão, fatura ou outro destino financeiro; realizado exige destino/instrumento adequado antes de guardar. A associação é recolhida ao confirmar um pendente como realizado.
- Relatórios e Configurações não apresentam FAB porque não têm ação de criação.
- O estado de implementação não equivale a validação final: QA local das páginas principais foi confirmado pelo utilizador; auditoria frontend direcionada e validações de cada nova branch continuam necessárias.

## Próxima sequência recomendada
1. Retirar a página autónoma de Dívidas e a sua integração de navegação; não integrar o código da página do PR #7.
2. Corrigir navegação e painel Mais para remover Dívidas como destino de página.
3. Desenhar/validar detalhes e modais de Movimentos e Cartões/faturas, incluindo consulta e liquidação de obrigações associadas.
4. Auditar e refatorar gradualmente Movimentos e `App.tsx` segundo React/TypeScript/Tamagui; limitar cada alteração ao escopo e validar build/lint/QA.
5. Fechar read models/contratos financeiros pendentes e implementar formulários/ações suportados.

## Critério para novas alterações estruturais
A implementação estrutural do frontend e do núcleo já está em curso e tem entregas publicadas na `main`. Para novas alterações estruturais, continuam obrigatórios: arquitetura/UML aprovada, precisão monetária e integridade transacional definidas, fluxos críticos especificados e critérios de aceitação/testes identificados. Não interpretar uma entrega parcial como aprovação de contratos ou funcionalidades ainda pendentes.

Protótipos ou experiências técnicas isoladas só devem avançar com autorização explícita e não constituem arquitetura aprovada.

## Atualização de decisões
Ao fechar uma decisão, atualizar o documento de origem, o estado nesta lista e os requisitos/diagramas afetados. Registar motivo e impacto quando substituir uma decisão. Não criar atas separadas por conversa.

---

> Documento de controlo do projeto. Atualizado em 2026-11-26.
>
> Este documento regista o estado conhecido no repositório e orienta a sequência de trabalho. Um item marcado como concluído significa que existe implementação ou decisão versionada; não significa que todos os fluxos relacionados estejam completos ou que a auditoria final tenha sido concluída.

## Legenda

- `[x]` concluído ou implementado no estado atual.
- `[ ]` por fazer.
- `[!]` bloqueado ou condicionado por contrato, decisão ou validação ainda em falta.

## 1. Fundamentos e arquitetura

- [x] Fechar os fundamentos do produto e as regras financeiras principais.
- [x] Consolidar regras de cartões, faturas, pagamentos, reversões, saldo inicial de cartão e saldo inicial de conta.
- [x] Aprovar o modelo ER conceptual e a decisão ARC-001.
- [x] Produzir e aprovar UML complementar de domínio, sequências e máquinas de estado do núcleo financeiro.
- [x] Aprovar o modelo físico do núcleo financeiro, precisão monetária e arredondamento (`DECIMAL(19,4)`); extensões conceptuais ainda sem migrations permanecem delimitadas.
- [x] Organizar a documentação na pasta `docs/`.

## 2. Backend e núcleo financeiro

- [x] Criar a estrutura Laravel do backend.
- [x] Criar as migrations principais do núcleo financeiro.
- [x] Criar contas financeiras, cartões, dívidas e faturas.
- [x] Criar operações e lançamentos financeiros.
- [x] Criar alocações de compras.
- [x] Criar saldo inicial de cartão e distribuições.
- [x] Criar correções de saldo inicial.
- [x] Criar alocações de pagamentos.
- [x] Criar rastreabilidade de reversões de pagamentos.
- [x] Adicionar constraints e validações de integridade financeira.
- [x] Implementar serviços financeiros transacionais.
- [x] Implementar idempotência nos fluxos financeiros implementados.
- [x] Executar testes negativos de integridade.
- [x] Executar testes positivos de compras, pagamentos e reversões.
- [x] Completar a validação do modelo físico contra o núcleo financeiro implementado; cobertura e lacunas estão em [09 — Auditoria do backend e do núcleo](04-arquitetura-modelo-e-auditoria.md).
- [x] Definir e implementar o contrato mínimo de contas, categorias, despesas comuns e receitas — Fase 1.
- [x] Definir e implementar o contrato mínimo de transferências com duas pernas — Fase 2.
- [x] Implementar recorrências — Fase 3, conforme [12 — Contrato de recorrências](06-contratos-api.md).
- [!] Implementar gestão completa de dívidas: depende do contrato específico e das fases seguintes.

## 3. Autenticação e API

- [x] Implementar autenticação com Laravel Sanctum.
- [x] Implementar registo de utilizador e emissão de token.
- [x] Implementar login.
- [x] Implementar logout e revogação de token.
- [x] Implementar consulta do utilizador autenticado.
- [x] Implementar pedido de recuperação e redefinição de palavra-passe.
- [x] Implementar autorização e isolamento por utilizador nos endpoints existentes.
- [x] Implementar leitura de cartões.
- [x] Implementar leitura de detalhe de cartão.
- [x] Implementar leitura de faturas.
- [x] Implementar leitura de operações.
- [x] Implementar endpoint de saldo inicial de cartão.
- [x] Implementar endpoint de compras parceladas.
- [x] Implementar endpoint de alocação de pagamentos.
- [x] Implementar endpoint de reversão de pagamentos.
- [x] Implementar endpoints mínimos de contas.
- [x] Implementar endpoints mínimos de categorias.
- [x] Implementar endpoints mínimos de despesas comuns.
- [x] Implementar endpoints mínimos de receitas.
- [x] Implementar endpoint mínimo de transferências com confirmação de pernas pendentes.
- [x] Implementar endpoints de recorrências, geração idempotente, materialização e alterações de ocorrências.
- [ ] Implementar endpoints de transferências.
- [ ] Implementar endpoints de edição, cancelamento, eliminação e reversão contextual.
- [ ] Integrar o frontend com a API e a autenticação.

## 4. Dashboard e Design System

- [x] Escolher React + TypeScript + Vite.
- [x] Escolher desenvolvimento local puro.
- [x] Implementar o Dashboard aprovado.
- [x] Implementar as variantes desktop e mobile do Dashboard.
- [x] Implementar sidebar recolhível no desktop.
- [x] Implementar navegação inferior fixa em todas as páginas mobile/tablet (Dashboard e subpáginas).
- [x] Implementar seletor mensal.
- [x] Implementar saldo, receitas, despesas e resultado.
- [x] Centralizar criação no botão flutuante global (+), fixo no viewport, com opções de despesa, receita e transferência.
- [x] Corrigir contenção e overflow da sidebar; apresentar apenas o nome do utilizador no perfil.
- [x] Implementar despesas por categoria em desktop e mobile.
- [x] Preservar o Dashboard durante a implementação dos formulários.
- [x] Criar tokens e componentes base reutilizáveis do Design System.
- [ ] Auditar completamente a substituição de estilos hardcoded e regressões entre breakpoints.

## 5. Especificação dos formulários

- [x] Definir e aprovar a especificação visual e de interação dos formulários.
- [x] Aprovar modal centralizado para desktop/tablet.
- [x] Aprovar bottom sheet para mobile.
- [x] Aprovar full screen para formulários extensos.
- [x] Aprovar campos, valor monetário, listas, datas, confirmação e rodapé fixo.
- [x] Aprovar proteção contra alterações não guardadas.
- [x] Aprovar loading, erros, estados vazios e navegação multi-step.
- [x] Confrontar a especificação visual com as regras funcionais.
- [x] Identificar campos e fluxos que não podem ser inventados.

## 6. Infraestrutura visual dos formulários — Fase A

- [x] Criar `FormModal`, `FormSheet` e `ResponsiveFormContainer`.
- [x] Criar `FullScreenForm` e infraestrutura multi-step.
- [x] Criar campos reutilizáveis, incluindo `MoneyInput` e `DateInput`.
- [x] Criar listas reutilizáveis para categorias, contas e cartões.
- [x] Criar estados de loading, erro e vazio.
- [x] Criar confirmação adaptativa e proteção contra alterações não guardadas.
- [x] Bloquear o scroll do `body` durante modais e diálogos.
- [x] Corrigir a duplicação de modal no desktop.
- [x] Garantir um único formulário e um único overlay.
- [x] Adicionar safe areas mobile e identificador visual do bottom sheet.
- [x] Adicionar atalhos de data e diferenciação visual da transferência.
- [x] Remover categorias e contas fictícias.
- [x] Usar estados vazios quando não existem dados funcionais.
- [x] Validar com `npm run lint`, `npm run build` e `git diff --check`.
- [x] Publicar a Fase A na `origin/main` no commit `b2cf768`.

## 7. Cliente API e autenticação do frontend — Fase 4

- [x] Criar cliente HTTP centralizado.
- [x] Criar tipos TypeScript para respostas e erros da API.
- [x] Implementar login, logout e consulta `/auth/me` no frontend.
- [x] Implementar interfaces de entrada, criação de conta, recuperação e redefinição de palavra-passe.
- [x] Apresentar logout funcional no Dashboard desktop e mobile.
- [x] Armazenar e enviar o token Sanctum segundo a arquitetura aprovada.
- [x] Tratar respostas `401`, `422` e erros gerais.
- [x] Criar provider comum de loading e erro de sessão.
- [ ] Testar expiração e revogação de sessão no frontend com interação real.

## 8. Leitura de dados reais

- [x] Ligar o frontend às listagens de cartões, faturas e operações.
- [x] Disponibilizar leitura tipada do detalhe de cartão.
- [x] Remover dados estáticos de fatura e últimos movimentos onde existe fonte API disponível.
- [x] Mostrar loading, erro e vazio baseados nos dados do utilizador.
- [x] Implementar a leitura frontend das páginas Movimentos e Programações, incluindo KPIs mensais de operações realizadas, filtros de estado e consulta de ocorrências.
- [ ] Validar o isolamento entre utilizadores no consumo da API com interação real.

## 9. Formulários concretos suportados pelos contratos atuais

Estes são os únicos fluxos de escrita que têm contratos backend confirmados neste momento.

- [ ] Formulário de saldo inicial de cartão.
- [ ] Distribuição integral do saldo inicial por faturas.
- [ ] Validação da soma das distribuições.
- [ ] Formulário de compra parcelada.
- [ ] Distribuição da compra pelos ciclos.
- [ ] Resumo e confirmação da compra.
- [ ] Idempotência e tratamento de erros do envio da compra.
- [ ] Formulário de alocação de pagamento.
- [ ] Seleção de obrigações da mesma fatura.
- [ ] Validação de pagamento parcial.
- [ ] Formulário de reversão parcial ou total.
- [ ] Apresentação da operação original antes da reversão.
- [ ] Mapeamento de erros financeiros para mensagens contextuais.
- [ ] Garantia de que nenhum efeito financeiro é criado antes da confirmação.

## 10. Contratos ainda necessários

- [ ] Definir campos e endpoints de contas.
- [ ] Definir campos e endpoints de categorias.
- [ ] Definir campos e endpoints de despesas.
- [ ] Definir campos e endpoints de receitas.
- [ ] Definir campos e endpoints de transferências.
- [ ] Definir permissões e ações por estado.
- [ ] Definir edição, cancelamento, eliminação e reversão contextual.
- [ ] Definir pagamento completo de faturas.
- [ ] Fechar políticas de faturas vencidas, ciclos anteriores e crédito negativo.
- [ ] Fechar precisão monetária e arredondamento.

Enquanto estes contratos não existirem, o frontend não deve criar categorias, contas, endpoints, payloads ou fluxos fictícios.

## 11. Formulários comuns após os contratos

- [ ] Implementar despesa.
- [ ] Implementar receita.
- [ ] Implementar transferência.
- [ ] Implementar criação e edição de conta.
- [ ] Implementar criação e edição de cartão.
- [ ] Integrar o saldo inicial à criação do cartão.
- [ ] Implementar pagamento de fatura.
- [ ] Implementar edição, cancelamento, eliminação e reversão conforme o estado.
- [ ] Implementar menus contextuais adaptativos.

## Decisão de execução — 2026-11-25

Antes de implementar os formulários concretos, o produto deve completar as subpáginas principais em modo de leitura. Esta ordem reduz retrabalho, permite validar a navegação e o `AppShell` em todos os tamanhos de ecrã e garante que cada página é ligada apenas aos dados e contratos já existentes.

A sequência de páginas/subpáginas é: Movimentos/Programações, Contas, Cartões e faturas, Rota Financeira, Relatórios e Configurações. Não existe página autónoma de Dívidas; os detalhes de obrigações são acessados a partir dos movimentos/faturas relacionados. Os formulários de escrita avançam respeitando os contratos backend confirmados.

A Rota Financeira está especificada visualmente, mas não pode ser implementada com projeções fictícias nesta etapa. A API atual não expõe ainda um read model diário de projeção e faltam no frontend os dados de classificação fixa/variável/excluída e as regras completas de obrigações futuras. A sua implementação fica condicionada ao fecho desse contrato de leitura e projeção.

## 12. Subpáginas

- [x] Implementar Movimentos e a aba Programações em modo de leitura.
- [!] Implementar Rota Financeira — aguarda contrato/read model de projeção diária.
- [ ] Validar e concluir Contas em modo de leitura (UI em `feature/accounts-page`: hierarquia do saldo total, secção As minhas contas e menu contextual por conta; os saldos reais continuam condicionados ao contrato/read model disponível).
- [x] Implementar Cartões e detalhe de faturas em modo de leitura (lista reutiliza hierarquia de Contas; faturas consultadas dentro do cartão selecionado; detalhe da fatura lista os movimentos associados, agrupados por dia e reutilizando a linha de Movimentos, sem filtros de estado).
- [x] Decisão de produto: descontinuar a página autónoma de Dívidas.
- [ ] Implementar consulta e liquidação de obrigações nos detalhes de movimentos/faturas, conforme os contratos aprovados.
- [ ] Implementar Relatórios.
- [ ] Implementar Configurações conforme a navegação aprovada.
- [ ] Garantir que operações com vários lançamentos aparecem uma única vez.

## 13. Testes e auditoria final

- [x] Testar invariantes financeiras básicas.
- [x] Testar compras parceladas sem duplicar despesas.
- [x] Testar pagamentos parciais.
- [x] Testar reversões parciais.
- [x] Testar autenticação e revogação de tokens no backend.
- [x] Testar isolamento de dados no backend.
- [ ] Testar o cliente API e os formulários no frontend.
- [ ] Testar desktop, tablet e mobile.
- [ ] Testar teclado, safe areas e rodapé fixo.
- [ ] Testar loading, erro, vazio e alterações não guardadas.
- [ ] Testar ações permitidas por estado.
- [ ] Testar fluxos completos de pagamentos e reversões pela UI.
- [ ] Auditar que nenhuma regra financeira foi duplicada no frontend.
- [ ] Auditar que o Dashboard não foi alterado.
- [ ] Auditar consistência entre documentação, API, frontend e modelo ER.
- [ ] Fazer commit final e publicar a versão aprovada.

## Próxima sequência de execução

1. Completar/validar as subpáginas em modo de leitura: Contas, Cartões/faturas, Rota Financeira, Relatórios e Configurações; não implementar página autónoma de Dívidas.
2. Fechar os contratos de leitura e projeção necessários para a Rota Financeira, sem criar dados ou regras fictícias.
3. Validar a navegação e o `AppShell` em desktop, tablet e mobile.
4. Implementar os formulários suportados pelos contratos atuais.
5. Validar os fluxos completos no frontend.
6. Implementar os formulários comuns após o fecho dos contratos pendentes.
7. Executar a auditoria final e publicar apenas após autorização explícita.

## Publicação e validação — 2026-11-25

- PR #5 foi integrado na `main` no merge commit `6b6efea51122de0d648ece393d7cc2e6a82e0f73`.
- A navegação responsiva, o painel Mais e o FAB global estão implementados; as opções fixas do FAB nas páginas principais de operações e as regras do menu contextual estão registadas em `docs/03-interface-e-formularios.md`.
- A regra de entrada global de criação foi sincronizada com `docs/03-interface-e-formularios.md`: o FAB pertence ao `AppShell`, não é duplicado dentro dos formulários, e opções sem suporte continuam indisponíveis.
- Build, lint e testes frontend não foram executados após o merge do PR #5. A validação visual/responsiva e a auditoria final permanecem pendentes.

## Regra de controlo

Este documento é um mapa de execução, não substitui as especificações funcionais, financeiras ou de arquitetura. Quando houver conflito, prevalecem `AGENTS.md`, as regras financeiras, a especificação funcional e as decisões aprovadas nos documentos de origem. Cada alteração relevante deve atualizar este estado no mesmo conjunto de alterações, sem marcar como concluído algo que apenas foi proposto.

## Navegação responsiva e entrada de criação — complemento 2026-11-26

- A ação **Mais** existe exclusivamente na bottom bar; não aparece na sidebar.
- A bottom bar é consistente em todas as páginas mobile/tablet e apresenta Início, Movimentos, Rota, Contas e Mais.
- **Mais** abre sempre o mesmo painel inferior integrado, com as três opções fixas e na mesma ordem: Cartões, Relatórios e Configurações.
- O painel Mais não apresenta perfil, notificações, logout ou opções dependentes da página atual. Ao selecionar uma página, navega e fecha; ao tocar novamente em Mais ou fora do painel, fecha.
- A sidebar apresenta todas as páginas, agrupadas em Principal, Gestão financeira e Ferramentas.
- Dashboard, Movimentos e Rota Financeira: FAB global (+) com as mesmas três opções, sempre na mesma ordem: **Novo gasto**, **Novo rendimento**, **Nova transferência**. Não varia conforme a página nem apresenta ações adicionais de dívida, programação ou projeção.
- **Gasto** é o termo de interface; a natureza técnica/financeira mantém `EXPENSE`/despesa. O meio de pagamento define se a operação gera efeito numa conta, fatura/cartão ou obrigação em aberto, conforme os contratos financeiros.
- Recorrência é uma configuração do fluxo de gasto/rendimento; não é uma quarta opção independente no FAB.
- Contas e Cartões mantêm ações de criação de entidade no contexto das respetivas páginas. Os formulários ainda indisponíveis devem comunicar isso sem criar dados fictícios.
- Não existe ação genérica **Nova dívida** no FAB nem página autónoma de Dívidas. Financiamento recebido ou registo de obrigação preexistente exige fluxo próprio ainda por especificar; obrigações ligadas a gastos são consultadas/liquidadas no contexto dos movimentos/faturas associados.
- Não existe ação **Nova projeção** no FAB: a projeção é calculada na Rota Financeira.
- Relatórios e Configurações não apresentam FAB quando não há ação de criação aprovada.
- O menu contextual `⋮` dos movimentos tem composição aprovada em `docs/03-interface-e-formularios.md`; a implementação e as ações por estado dependem dos contratos API pendentes.
- A linha de uma compra parcelada apresenta o valor da prestação do período; o valor total da compra só é mostrado ao abrir o detalhe. A indicação de prestações pagas é secundária/discreta.
- O menu contextual `⋮` dos movimentos tem hierarquia aprovada: Editar, Duplicar, ação de estado, ações específicas do tipo, separador e ação destrutiva final (Eliminar se elegível; Estornar para operação realizada). A composição está aprovada; contratos de permissões, transições, endpoints e fluxos de pagamento/estorno continuam pendentes.
- Ações sem formulário/contrato não são executáveis nem criam registos fictícios. Relatórios e Configurações permanecem páginas-placeholder até à implementação funcional. A página autónoma de Dívidas está descontinuada.
