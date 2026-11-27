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
| Moeda | Se a moeda principal pode mudar depois de existirem movimentos. A precisão e o arredondamento do núcleo estão aprovados em ARC-003 (`DECIMAL(19,4)`, aritmética decimal exata e apresentação half-up a duas casas). |
| Saldo inicial de conta | **Decidido:** informar o saldo existente ao iniciar a utilização da conta no Orbe; registar como abertura, não como receita/despesa. |

### Rota Financeira — princípio consolidado e decisões (2026-11-27)

**Regra fundamental aprovada:** saldo projetado do dia = saldo projetado do dia anterior + entradas planeadas − saídas planeadas. A Rota simula a evolução acumulada do cenário financeiro a partir do saldo efetivo de referência, incorporando todos os efeitos elegíveis nas respetivas datas, incluindo operações planeadas ainda não realizadas.

A Rota não cria regras de negócio, entidades, operações, motor ou base de dados próprios. Usa exclusivamente os dados e as regras financeiras comuns do Orbe, consultados/calculados a partir da mesma base de dados que alimenta o restante sistema. Operação realizada substitui o efeito projetado correspondente sem duplicação; alterações e cancelamentos recalculam a projeção.

**Decisões consolidadas:**
- Movimentos e Rota usam a mesma base de operações/efeitos válidos; Movimentos apresenta operações individualmente e a Rota agrega os efeitos por data.
- O saldo de referência é a soma dos saldos atuais de contas bancárias e dinheiro; cartões de crédito ficam excluídos.
- Gastos/ganhos pendentes entram na projeção mesmo sem conta associada. Efeitos realizados já refletidos no saldo atual não podem ser reaplicados.
- Movimentos apresenta compras de cartão individualmente. A Rota projeta cada fatura uma única vez pelo total ainda por pagar, na data prevista, sem projetar também as compras que a compõem.
- Plano vencido sem confirmação permanece vencido; não recebe nova data automática.
- Faturas de ciclos anteriores com saldo em dívida são agrupadas como vencidas no resumo, mantendo cada fatura consultável.
- Plano parcial projeta parcelas nas datas planeadas e apenas o residual não reservado no vencimento da fatura.

**Questões ainda em aberto:**
- Débito automático/reagendamento: definir quando uma regra explícita pode gerar nova data projetada e como evitar projeção simultânea da data vencida e da nova data.
- Crédito negativo de fatura: confirmar a regra de aplicação do crédito (proposta anterior: obrigação mais antiga do mesmo cartão) e garantir que não cria entrada fictícia em conta.
- Compra no dia do fecho: confirmar que a alocação segue a regra/ciclo configurado no cartão e documentar o comportamento quando a data coincide exatamente com o fecho.
- Operações realizadas com data efetiva futura: definir como são tratadas no saldo atual de referência e na projeção, para não refletir o mesmo efeito antes da data efetiva nem duplicá-lo nessa data.

**Resolvido nesta revisão:** definição do saldo inicial, fórmula acumulada diária, continuidade entre dias/períodos e princípio de cálculo/read model comum. O read model deve expor/calcular os efeitos elegíveis por data a partir do domínio financeiro central; não é uma fonte financeira paralela.

**Contrato de saldo inicial de cartão definido:** saldo inicial positivo é integralmente distribuído por faturas; não existe parcela por distribuir, obrigação especial em dívidas ou novo destino financeiro. A operação original é única por cartão. Distribuições históricas são imutáveis; correções e reversões são rastreáveis. A obrigação em aberto deriva exclusivamente de `financial_entries`.

**Contrato de saldo inicial de conta definido:** ao criar uma conta, informar o saldo existente no início da utilização no Orbe. O valor é reconhecido por operação `ACCOUNT_OPENING_BALANCE` e lançamento realizado dirigido à conta; não é receita/despesa. Saldo zero não gera lançamento; saldo negativo só é permitido quando compatível com o tipo de conta. Existe uma única abertura original por conta, não editável diretamente; correções preservam a origem e são rastreáveis. O saldo atual deriva dos lançamentos válidos.

## Trabalho funcional pendente
- Contratos/read models de saldos e projeções continuam pendentes, especialmente saldo diário/final e projeção na Rota Financeira.
- Formulários de escrita ainda não estão todos integrados; implementar apenas os fluxos cobertos por contratos aprovados.
- Dívidas/obrigações: não existe página principal autónoma. O código da página foi removido pelo PR #7, integrado na `main` (squash commit `5058a9351deba9291a1d73f9699673cead00d6d5`). Obrigações associadas a gastos permanecem no modelo financeiro e são consultadas/liquidadas a partir dos movimentos/faturas relacionados. Financiamentos ou obrigações preexistentes exigem fluxo específico ainda por definir; isso não autoriza reintroduzir uma página autónoma. Nenhum valor é simulado.
- Definir subpáginas e modais das páginas primárias, sem inventar campos ou regras funcionais.
- Auditar/refatorar gradualmente páginas existentes com problemas de arquitetura React, começando por Movimentos e responsabilidades excessivas em `App.tsx`; não fazer refatoração global.
- Definir validações e ações por estado/dependência quando os contratos forem tratados.

## Estado da implementação frontend — 2026-11-27

- PR #3: página Contas em modo de leitura publicada na `main`.
- PR #4: página Cartões e detalhe de faturas em modo de leitura publicados na `main`.
- PR #5: navegação responsiva, painel Mais e FAB global contextual publicados na `main` (merge commit `6b6efea51122de0d648ece393d7cc2e6a82e0f73`).
- Movimentos/Programações: leitura implementada; formulários de programação continuam indisponíveis.
- Rota Financeira: interface trimestral desktop e mensal mobile publicada na `main`; os dados realizados são agregados a partir do read model atual. Saldo diário/final, projeção e classificação fixa/variável continuam indisponíveis.
- PR #7 foi integrado na `main` (squash commit `5058a9351deba9291a1d73f9699673cead00d6d5`): remove Dívidas da navegação e o placeholder, usa o FAB fixo **Novo gasto**, **Novo rendimento**, **Nova transferência** em Dashboard/Movimentos/Rota e mantém as mesmas ações na aba Programações. O título dos formulários comuns também usa a terminologia aprovada.
- Backend da branch: gasto/rendimento pendente sem destino financeiro; realizado exige conta ativa; confirmação recolhe conta e cria lançamento; recorrências pendentes não guardam destino até à materialização.
- Validação local reportada pelo utilizador: **52 testes backend passaram (217 assertions)** e Pint `--test` passou nos 7 ficheiros PHP alterados. O Pint global reporta 63 problemas de estilo em 98 ficheiros preexistentes/abrangidos; não foi aplicada formatação global.
- Após o PR #7, a workflow `Web CI` passou lint, TypeScript e build de produção na branch `feature/reports-settings-ui-clean` (PR #9, run 45975451168, commit `71cff376`). A QA visual/responsiva em desktop/tablet/mobile continua pendente. O rate limit da Vercel é um limite de deploy e não invalida o CI concluído.
- Formulários de escrita, consulta/liquidação contextual de obrigações e projeções reais permanecem por implementar/validar. A ausência de página autónoma de Dívidas é uma decisão aprovada, não uma funcionalidade em falta.

## Próxima sequência recomendada
1. QA visual/responsiva de Relatórios e Configurações em desktop/tablet/mobile, incluindo gráfico diário, cabeçalho/seletor, estados loading/erro/vazio, layout de Perfil sem quebra artificial, lista de 10 moedas, persistência do símbolo e alternância/persistência do tema claro/escuro.
2. Validar a regra pendente→realizado no frontend: sem destino no pendente; conta obrigatória na confirmação.
3. Desenhar/validar detalhes e modais de Movimentos e Cartões/faturas, incluindo consulta/liquidação de obrigações associadas.
4. Fechar contratos/read models financeiros pendentes, sobretudo projeção diária, e implementar os formulários suportados.
5. Executar auditoria final de consistência entre documentação, API, frontend e modelo ER.

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
- [x] Regra de destino pendente/realizado aplicada no backend da branch `feature/debts-primary-page`: gasto/rendimento `PENDING` é criado sem `account_id` e sem lançamento; criação `REALIZED` exige conta ativa; confirmação recebe a conta e cria o lançamento na mesma transação; programações/ocorrências de recorrência são criadas sem conta e recolhem destino na materialização. O utilizador executou localmente a suite completa: **52 testes passaram (217 assertions)**. O Pint `--test` nos 7 ficheiros PHP alterados também passou.
- [!] Especificar e implementar fluxos próprios para financiamento ou obrigações preexistentes, quando aprovados. Esta pendência não reabre nem implica uma página autónoma de Dívidas; obrigações associadas a gastos continuam a ser consultadas/liquidadas no contexto dos movimentos/faturas relacionados.

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
- [ ] Implementar endpoints de edição, cancelamento, eliminação e reversão contextual.
- [x] Integrar frontend com API e autenticação para leitura e criação básica de Movimentos; ações contextuais e restantes formulários continuam pendentes.

## 4. Dashboard e Design System

- [x] Escolher React + TypeScript + Vite.
- [x] Escolher desenvolvimento local puro.
- [x] Implementar o Dashboard aprovado.
- [x] Implementar as variantes desktop e mobile do Dashboard.
- [x] Implementar sidebar recolhível no desktop.
- [x] Implementar navegação inferior fixa em todas as páginas mobile/tablet (Dashboard e subpáginas).
- [x] Implementar seletor mensal.
- [x] Implementar saldo, receitas, despesas e resultado.
- [x] Centralizar criação no botão flutuante global (+), fixo no viewport, com opções fixas **Novo gasto**, **Novo rendimento** e **Nova transferência**, na mesma ordem nas páginas Dashboard, Movimentos e Rota Financeira.
- [x] Corrigir contenção e overflow da sidebar; apresentar apenas o nome do utilizador no perfil.
- [x] Implementar despesas por categoria em desktop e mobile.
- [x] Preservar o Dashboard durante a implementação dos formulários.
- [x] Criar tokens e componentes base reutilizáveis do Design System.
- [ ] Auditar completamente a substituição de estilos hardcoded e regressões entre breakpoints.

## Dados de QA locais — Movimentos

- [x] Criar `QaFinancialDataSeeder` idempotente para preparar contas e categorias de QA antes de existirem formulários de gestão.
- [x] Associar os registos ao utilizador local `test@example.com`, sem semear dados para todos os utilizadores.
- [x] Incluir contas ativas BANK/CASH, uma conta encerrada, categorias ativas EXPENSE/INCOME e uma categoria arquivada.
- [x] Integrar o seeder no `DatabaseSeeder` e documentar execução isolada.
- [x] Não criar saldos, operações ou lançamentos artificiais; respeitar o motor financeiro para abertura de saldo.

Execução local: `php artisan db:seed --class=QaFinancialDataSeeder` (na pasta `backend`). Os registos são identificados pelo prefixo `QA —`; a execução repetida atualiza os mesmos registos em vez de duplicá-los.

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

- [x] Definir campos e endpoints de contas (GET/POST implementados).
- [x] Definir campos e endpoints de categorias (GET/POST implementados).
- [x] Definir campos e endpoints de despesas (POST implementado).
- [x] Definir campos e endpoints de receitas (POST implementado).
- [x] Definir campos e endpoints de transferências (POST e confirmação de perna implementados).
- [ ] Definir permissões e ações por estado.
- [ ] Definir edição, cancelamento, eliminação e reversão contextual.
- [ ] Definir pagamento completo de faturas.
- [ ] Fechar políticas de faturas vencidas, ciclos anteriores e crédito negativo.
- [x] Fechar precisão monetária e arredondamento para o núcleo financeiro: `DECIMAL(19,4)`, aritmética decimal exata e apresentação half-up a duas casas (ARC-003).

Os contratos de criação de contas, categorias, despesas, receitas e transferências estão definidos e implementados no backend. Ações por estado, edição, cancelamento, eliminação e reversão contextual continuam condicionadas aos contratos e endpoints específicos; o frontend não deve inventá-los.

## Implementação frontend — Movimentos (Fase 2, branch `feature/movements-write-flows`)

- Os formulários de gasto, rendimento e transferência passaram a usar o read model real de contas/categorias ativas; foram removidas listas vazias fixas.
- Gasto/rendimento permitem estado `REALIZED` ou `PENDING`. Realizado envia conta + `effective_at`; pendente não envia conta e envia `planned_at`.
- Transferência envia uma operação única com pernas `OUT` e `IN`, cada uma com conta, estado e data própria, respeitando o contrato existente.
- Submissão usa os endpoints existentes, chave de idempotência, bloqueio de submissão duplicada, validação local e mapeamento de erros API para o formulário.
- Gasto/rendimento também permitem configurar uma programação recorrente dentro do mesmo formulário, com periodicidade e data de fim opcional; a criação da programação não cria operação efetiva nem lançamento.
- Após sucesso, o read model financeiro é atualizado e o utilizador recebe feedback contextual.
- Validação CI no commit `fc27911e5a69f29d8882a826f64f22d7ddada605`: Web CI passou `npm ci`, ESLint e TypeScript/Vite build ([run 45991947575](https://github.com/lc-curto/Orbe/actions/runs/45991947575)); PR Quality Gate passou ([run 45991947579](https://github.com/lc-curto/Orbe/actions/runs/45991947579)). QA manual do formulário permanece pendente.
- Edição, confirmação de movimentos pendentes na listagem, cancelamento, eliminação, reversão e menus contextuais continuam pendentes por dependerem de fluxos/endpoints adicionais. Não foram simulados.

## 11. Formulários comuns após os contratos

- [x] Implementar criação de gasto (realizado ou pendente) no formulário de Movimentos.
- [x] Implementar criação de rendimento (realizado ou pendente) no formulário de Movimentos.
- [x] Implementar criação de transferência com estado e data independentes para cada perna.
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
- [x] Implementar a interface da Rota Financeira (desktop trimestral e mobile mensal). [!] Saldo diário/final, projeção e classificação fixa/variável dependem de contrato/read model ainda pendente; não apresentar valores simulados.
- [x] Implementar e validar localmente a página Contas em modo de leitura (hierarquia do saldo total, secção As minhas contas e menu contextual por conta). Os saldos apresentados continuam condicionados aos dados/read model disponíveis.
- [x] Implementar Cartões e detalhe de faturas em modo de leitura (lista reutiliza hierarquia de Contas; faturas consultadas dentro do cartão selecionado; detalhe da fatura lista os movimentos associados, agrupados por dia e reutilizando a linha de Movimentos, sem filtros de estado).
- [x] Decisão de produto: descontinuar a página autónoma de Dívidas.
- [ ] Implementar consulta e liquidação de obrigações nos detalhes de movimentos/faturas, conforme os contratos aprovados.
- [x] Implementar Relatórios na branch `feature/reports-settings-ui-clean`: gráfico diário como bloco principal, ranking das cinco principais despesas por categoria e resumo mensal (receitas, despesas e resultado); sem KPIs, atividade por conta ou painéis de faturas/obrigações nesta iteração. Dados realizados, sem transferências nem projeções. QA visual/responsiva pendente.
- [x] Implementar Configurações na branch `feature/reports-settings-ui-clean`: layout de Perfil responsivo, 10 opções de moeda incluindo BRL (símbolo apenas) e preferência global de tema claro/escuro persistida localmente. QA visual/responsiva pendente.
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

1. Concluir CI da branch atual (lint + TypeScript/Vite build) e corrigir todos os erros antes de abrir PR.
2. Fazer QA visual/responsivo de Relatórios e Configurações em desktop, tablet e mobile; verificar loading, erro e vazio, navegação, seletor mensal e persistência local do símbolo.
3. Validar a regra pendente→realizado no frontend: sem destino no pendente; conta obrigatória na confirmação.
4. Implementar detalhes/ações de Movimentos e Cartões/faturas apenas depois de os contratos/read models associados estarem fechados, incluindo consulta/liquidação de obrigações.
5. Fechar contratos/read models financeiros pendentes (incluindo projeções) e implementar os formulários suportados.
6. Executar auditoria final e publicar a versão validada.

## Ordem de refatoração incremental das páginas

A refatoração é oportunista e acompanha a implementação de cada funcionalidade; não fazer uma refatoração transversal de todas as páginas de uma vez. Quando uma página for tocada por uma feature, aproveitar para melhorar a sua separação interna sem alterar comportamento, contratos API ou regras financeiras. Ordem de prioridade:

1. **Movimentos** — separar a orquestração da página, filtros/Programações e lógica de apresentação; manter `MovementRow` como componente partilhado e extrair lógica pura para `utils`/hooks quando houver ganho claro.
2. **Cartões** — separar lista de cartões, consulta/detalhe de faturas e seletores derivados; reutilizar `MovementRow` e não importar componentes diretamente de páginas de Movimentos.
3. **Contas** — separar lista, detalhe e conferência por conta quando os fluxos forem implementados; manter saldo e movimentos derivados dos read models/API, sem duplicar cálculos financeiros.
4. **Rota Financeira** — preservar os componentes/tipos/hooks/utilities já extraídos; ao implementar novos dados, isolar consultas e cálculo de projeção num serviço/read model testável, conforme contratos aprovados.
5. **Dashboard** — desktop e mobile já estão separados; ao ligar dados reais, retirar valores de apresentação hardcoded e dividir secções apenas quando houver responsabilidade independente, mantendo Dashboard como fotografia atual e sem projeções.

Em cada refatoração: confirmar comportamento atual, definir ficheiros afetados, fazer alteração pequena, reutilizar componentes existentes, executar lint/build e testes disponíveis, e comparar desktop/mobile. Não introduzir abstrações genéricas ou dependências sem necessidade demonstrável.

## Publicação e validação — 2026-11-26

- PR #5 foi integrado na `main` no merge commit `6b6efea51122de0d648ece393d7cc2e6a82e0f73`.
- O PR #7 (`feature/debts-primary-page`) atualiza o backend para destinos financeiros pendentes/realizados e corrige a UI: remove Dívidas como página/destino, elimina o placeholder, e fixa o FAB em **Novo gasto**, **Novo rendimento**, **Nova transferência** também na aba Programações.
- Validação backend local reportada pelo utilizador: **52 testes passaram, 217 assertions**; Pint `--test` nos 7 ficheiros PHP alterados passou.
- O Pint global continua a reportar **63 problemas de estilo em 98 ficheiros**; não foi aplicado formatting global para evitar alterações fora do escopo.
- Pós-merge: a referência global `RuntimeException` da migration foi corrigida e foi aplicada formatação nos controllers em commits `68ed3ea`, `eb2ecb3`, `9f67bb0` e `efe8df3`. Estes ajustes não alteram as regras de domínio; a suite não foi reexecutada após os commits remotos.
- CI após as alterações do PR #7 passou lint e build de produção na branch feature/reports-settings-ui-clean (PR #9, run 45880748947, commit `960c156`). A QA visual/responsiva continua pendente. O status Vercel anterior falhou por rate limit de deploy, não por falha de build.

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
- Ações sem formulário/contrato não são executáveis nem criam registos fictícios. Relatórios e Configurações têm interface implementada na branch feature/reports-settings-ui-clean; lint, TypeScript e build de produção passaram no CI atualizado (run 45975362442, commit 1e8a55b), enquanto QA visual no browser continua pendente. A página autónoma de Dívidas está descontinuada.


## Implementação frontend — Relatórios e Configurações (branch `feature/reports-settings-ui-clean`, PR #9, atualização 2026-11-27)
- Criadas páginas React/TypeScript dedicadas e integradas nas variantes desktop e mobile do shell existente.
- Relatórios usa o componente MonthSelector existente; a agregação de operações realizadas foi isolada em `features/reports/utils.ts`. Apresenta apenas dimensões suportadas pelos dados atuais. A análise de obrigações sem read model disponível é explicitamente indisponível; não há valores fictícios.
- Configurações apresenta os grupos aprovados. A preferência de símbolo é funcional e guardada no navegador; as opções sem contratos/painéis próprios são informativas, não ações simuladas.
- Regra aprovada: a alteração de símbolo não converte nem altera valores, dados, saldos, cálculos, escala ou precisão.
- Lint, TypeScript e build de produção passaram no CI da branch (run 45975451168, commit `71cff376`). A QA visual/responsiva em browser e a revisão final continuam pendentes antes de integrar na main.


## Organização frontend — branch `feature/reports-settings-ui-clean` (PR #9, 2026-11-26)
- Mantida a funcionalidade de Relatórios, Configurações e preferência de símbolo; a reorganização é estrutural, sem alterar contratos financeiros.
- `app/`: composição da aplicação, shell e estado/navegação global.
- `features/dashboard/`: Dashboard desktop (`pages/DashboardPage.tsx`), Dashboard mobile (`components/MobileDashboard.tsx`) e especificação visual (`specs/`).
- `features/`: páginas e componentes por domínio (auth, dashboard, movements, accounts, cards, financial-route, reports, settings, currency).
- `shared/components/`: seletor mensal reutilizável e componentes comuns.
- `features/movements/components/`: formulário de movimentos e linha de movimento partilhada com Cartões.
- `styles/` e `features/*/styles/`: CSS transversal e estilos separados por área; `index.css` apenas agrega os imports ordenados.
- `MobileDashboardSpec.tsx` foi movido para `features/dashboard/specs/` para separar a especificação visual da interface executada.
- Lint e build passaram no CI da branch (run 45880748947, commit `960c156`); QA visual/responsiva continua pendente. Não integrar na `main` antes da QA e revisão.


### Stack web — decisão (26/11/2026)

Tamagui foi removido da stack web. A interface utiliza React, TypeScript, HTML semântico, CSS e primitives próprias do design system em `web/src/design-system/primitives.tsx`. O tema global permanece baseado em `data-theme` e tokens CSS. Foram removidos Tamagui Provider/configuração/plugin, alias React Native Web e dependências Tamagui/react-native-web. A página de Configurações foi restaurada ao commit anterior à migração Tamagui; os restantes componentes que dependiam da biblioteca foram desacoplados de forma explícita.

**Validação CI:** `npm ci`, ESLint e build TypeScript/Vite passaram no run [45886977125](https://github.com/lc-curto/Orbe/actions/runs/45886977125). **QA visual desktop/mobile permanece pendente**.


### Correção responsiva da navegação (27/11/2026)

A primeira correção CSS não eliminou o problema observado em QA: as páginas eram montadas nas variantes desktop e mobile ao mesmo tempo, e os wrappers `Row` aplicavam `display:flex` inline. Em determinados breakpoints, isso permitia coexistência da sidebar, bottom bar e conteúdo repetido.

Correção estrutural:
- Desktop **> 1024 px**: variante desktop e sidebar; bottom bar e shells mobile ocultos.
- Tablet/mobile **≤ 1024 px**: variante mobile e bottom bar; layout desktop/sidebar ocultos.
- Wrappers responsivos usam elementos sem `display:flex` inline; CSS controla a visibilidade e o layout.
- A bottom bar usa as variáveis de superfície e borda do tema ativo.
- Os breakpoints das páginas e componentes foram alinhados ao limite de 1024 px.

**Validação:** ESLint e build TypeScript/Vite passaram no [CI run 45972363992](https://github.com/lc-curto/Orbe/actions/runs/45972363992), commit `80a308a`. QA visual em larguras 1440, 1280, 1024, 768, 390 e 320 px permanece necessária antes de integrar na `main`.


## Fase 1 — estabilização frontend e QA (iniciada em 2026-11-27)

A fase de estabilização parte do commit atual da `main` após os PRs #9 e #10. Não alterar regras de produto ou financeiras durante a QA visual; qualquer problema funcional descoberto deve ser registado e corrigido apenas dentro de um escopo explícito.

### Auditoria estática inicial

- A navegação global está configurada com sidebar apenas em desktop (>1024 px) e bottom bar em tablet/mobile (≤1024 px). O CSS e os wrappers responsivos usam este limite; a validação renderizada em browser continua pendente.
- **Dashboard — correção implementada na branch da Fase 1:** ganhos, gastos e despesas por categoria derivam agora das operações `REALIZED` com `effective_at` no mês selecionado. As categorias são agrupadas por categoria real (ou “Sem categoria”) e limitadas às cinco maiores. Não há valores de demonstração.
- O saldo disponível não é fornecido pelo read model atual; desktop e mobile mostram explicitamente **Indisponível**, sem estimativa frontend. O acesso às despesas por categoria encaminha para Movimentos; não promete filtro por categoria que ainda não existe.
- Os seletores do Dashboard e a Rota Financeira deixam de estar limitados a novembro/dezembro de 2026. A Rota inicia no mês corrente, sem alterar a regra de projeção nem inventar saldo final.
- A paridade desktop/mobile continua a exigir validação visual e interação em browser.

### Consistência de espaçamento — requisito da Fase 1

As capturas de Cartões, Rota Financeira e Relatórios mostram diferenças de margens externas, padding dos conteúdos e alinhamento dos blocos. Tratar como finding transversal de UI, não como correções isoladas por página.

- Definir/confirmar uma escala central de spacing tokens no Design System e reutilizá-la em todas as páginas.
- Padronizar o container de página: largura, alinhamento, gutter horizontal e espaçamento vertical entre título, descrição, filtros, conteúdo e navegação.
- Padronizar o padding interno de cards, painéis, tabelas e estados vazios; elementos equivalentes devem ter os mesmos valores.
- Remover valores arbitrários e overrides locais de `margin`/`padding` quando duplicam ou contradizem os tokens existentes.
- Permitir diferenças por breakpoint apenas quando justificadas pela responsividade, usando os mesmos tokens e regras previsíveis.
- Auditar Cartões, Rota Financeira, Relatórios e restantes páginas primárias lado a lado; verificar alinhamento das bordas dos conteúdos e consistência entre desktop/tablet/mobile.
- Não ajustar espaçamentos apenas para uma captura: corrigir a regra compartilhada ou documentar a exceção funcional.

**Implementação CSS na branch da Fase 1:** tokens centrais para gutters (32 px desktop, 24 px tablet, 16 px mobile), largura de conteúdo (1200 px), gap vertical (24 px) e padding de painéis (20 px desktop / 16 px mobile). Cartões, Contas, Relatórios e Rota usam containers e gutters comuns; exceções de densidade em linhas/tabelas mantêm-se intencionais.

**Continuação da estabilização:** `DashboardSections` partilha categorias, cartões e movimentos entre desktop/mobile; os movimentos do Dashboard passaram a usar `operation.id` como chave React estável. Os overrides redundantes de `!important` foram removidos do seletor mensal, dos filtros de pesquisa e de hover de Rota/Configurações/menu mobile. O alinhamento do cabeçalho de Movimentos foi consolidado no shell responsivo.

Critério de aceitação visual: confirmar no browser que as páginas seguem esta geometria sem overflow nem margens/paddings locais contraditórios nos viewports definidos.

### Política de refatoração oportuna e controlo de omissões — obrigatória

A política foi formalizada nos pontos de controlo do repositório:
- `AGENTS.md`: regra global, Gates A/B/C antes/durante/depois de cada alteração, práticas por stack e bloqueio de conclusão.
- `docs/04-arquitetura-modelo-e-auditoria.md`: padrões técnicos e refatoração incremental para React/TypeScript.
- `docs/03-interface-e-formularios.md`: regras de reutilização do design system, spacing e exceções de layout.
- `README.md`, `web/README.md` e `backend/README.md`: resumo operacional por aplicação.
- `.github/pull_request_template.md`: checklist obrigatória a preencher em cada PR, incluindo findings adiados e validações não executadas.

Para reduzir esquecimentos, o workflow `.github/workflows/pr-quality-gate.yml` valida automaticamente a descrição da PR: exige as secções obrigatórias e falha se houver checkbox por concluir. A checklist preenchida continua a ser uma declaração de revisão, não prova de execução; lint/build/testes e QA visual são barreiras distintas. A pessoa responsável deve assinalar e explicar pendências/N/A sem alegar execução. Nenhuma tarefa pode ser marcada como concluída se os gates forem ignorados ou se findings relevantes ficarem sem registo.

**Findings específicos da Fase 1:**
- A consolidação de spacing em `web/src/styles/app-shell.css` é uma primeira harmonização, não a auditoria final. Ainda é necessário reconciliar as regras antigas das features com os tokens e eliminar duplicação/contradições sem regressão visual.
- A revisão estática atual encontrou 60 declarações `!important` em `web/src/styles/theme.css` e quatro declarações de acessibilidade de movimento reduzido em `web/src/styles/base.css`. As declarações de tema são legado de compatibilidade entre estilos de tema e estilos de apresentação inline; não devem ser ampliadas. Migrar progressivamente os estilos inline para tokens/classes semânticos e remover cada override que deixe de ser necessário. A regra obrigatória está em `AGENTS.md` e `docs/03-interface-e-formularios.md`: `!important` é último recurso e cada nova ocorrência exige justificação explícita.
- A composição do Dashboard foi parcialmente unificada com `PageHeader` e `DashboardSections`; manter QA de paridade desktop/mobile e consolidar os KPIs quando a validação visual justificar.
- O `App.tsx` continua a concentrar navegação, estados e composição de páginas; a decomposição deve ser incremental, sem reescrita nem alteração de comportamento.

### Fase 1 — estabilização frontend: concluída e integrada

**Estado: QA visual aprovado e PR #11 integrado na `main`.**

- PR #11 foi merged em 27/11/2026. Merge commit: `d987e7ff1204328f775df3abd662db0da69244c6`.
- Commit final da branch de estabilização: `03b9b47e7777b7b21a9bdb6f3516bfde718790fc`.
- Web CI (ESLint, TypeScript e build Vite) e PR Quality Gate passaram no commit final.
- QA visual responsiva foi aprovado pelo utilizador após correções, incluindo o breakpoint de 320 px e a correção de visibilidade da página Movimentos acima de 1024 px.

#### Padrões e comportamentos aprovados

- Todas as páginas autenticadas usam os frames comuns `DesktopPageFrame` e `MobilePageFrame`.
- Todas as páginas usam o componente `PageHeader` para a estrutura comum de título/descrição/ações.
- Largura, gutters, alinhamento, ritmo vertical e safe area são centralizados no shell e nos tokens do design system; estilos de feature devem limitar-se às necessidades específicas do módulo.
- Seletor mensal no canto superior direito, na mesma linha do título, nas páginas que o apresentam.
- Rota Financeira: **um mês visível até 1024 px; três meses acima de 1024 px**.
- Movimentos permanece visível no layout desktop acima de 1024 px, dentro do `DesktopPageFrame`.

A regra de reutilização dos frames, cabeçalho e tokens está formalizada em `docs/03-interface-e-formularios.md` e aplica-se também a páginas futuras.

#### Trabalho técnico que permanece como evolução, não bloqueio do QA aprovado

- Migrar progressivamente estilos inline/legados para tokens e classes semânticas, removendo overrides de tema que deixem de ser necessários. A política de `!important` mantém-se: último recurso, nunca como solução estrutural, com justificação explícita para novas ocorrências.
- Continuar a decomposição incremental de `App.tsx`, sem reescrita nem alteração de comportamento.
- Continuar a reconciliação de CSS legado com tokens quando houver alterações nas respetivas features, evitando regressões visuais.

Estas melhorias não alteram o estado de QA aprovado da Fase 1; devem ser tratadas como trabalho técnico incremental e registadas nas tarefas/PRs correspondentes.



## Acessibilidade global — sessão e tema

- Logout desktop acessível diretamente no rodapé da sidebar, inclusive recolhida.
- Logout em viewport mobile/tablet acessível pelo painel **Mais** da bottom bar.
- O controlo de tema é fornecido pelo `PageHeader` partilhado em todos os breakpoints; o botão duplicado do shell foi removido. Não existe implementação exclusiva do Dashboard.
- O painel **Mais** mantém o controlo de tema como alternativa, incluindo vistas de Configurações que ocultam o cabeçalho durante a navegação interna.
- A preferência continua a ser aplicada e persistida pelo `ThemeProvider` existente.
- QA visual em browser desktop/tablet/mobile ainda necessário após atualização da branch.

## Ajuste de composição do cabeçalho mobile/tablet

- O breakpoint mobile/tablet do Orbe é `max-width: 1024px`.
- No Dashboard, o cumprimento e o primeiro nome permanecem numa linha; nomes extensos são truncados de forma controlada.
- Não apresentar subtítulo ou texto auxiliar debaixo do título da página; a data não é renderizada como descrição do cabeçalho.
- O controlo de tema usa o `PageHeader` partilhado e fica alinhado à direita; não deve ser implementado isoladamente por página.
- O período do Dashboard fica numa segunda linha, com rótulo `Período` e seletor alinhado à direita.
- Cabeçalhos com ações de página (por exemplo, seletor mensal) mantêm essas ações e apresentam o controlo de tema de forma empilhada no lado direito em mobile/tablet, evitando sobreposição.
- A validação final em browser nos breakpoints (incluindo 320 px, 768 px, 1024 px e 1025 px) é necessária antes de aprovar o PR.

## Refinamento visual transversal — implementação inicial (27/11/2026)

- Iniciada na branch `feature/movements-write-flows`, PR #12, sem alterações na `main`.
- Adicionada `web/src/styles/visual-polish.css`, importada após os estilos existentes, para consolidar tipografia sans-serif, paleta verde-azulada, cartões/superfícies, controlos, navegação e FAB.
- Removidos estilos inline de fundo da moldura mobile da Dashboard e do cartão de saldo para permitir que o tema/tokens partilhados controlem a apresentação.
- A camada visual é uma primeira harmonização; ainda requer revisão de regressões, QA em browser e eventual ajuste de componentes com estilos inline legados.
- Não foram alteradas regras financeiras nem contratos API.
- Web CI (ESLint, TypeScript e build Vite) e PR Quality Gate passaram no commit de implementação c4483165. QA visual manual do utilizador permanece pendente.


### Refinamento transversal de interface — 27/11/2026

- Cabeçalho principal sem descrição ou texto auxiliar imediatamente abaixo do título, aplicado pelo componente `PageHeader`.
- Seletor de mês partilhado no padrão opção 2: mês abreviado + ano completo (`Nov 2026`), setas discretas nos dois lados, sem superfície/borda; removida a etiqueta redundante “Período” na Dashboard.
- Na Rota Financeira mobile, o resumo mensal fica antes dos filtros de visualização.
- Regras transversais de ordem de KPIs/cards, pesquisa e filtros, além dos critérios de light/dark mode, registadas em `docs/03-interface-e-formularios.md`.
- A correção de dark mode cobre também o shell mobile (`mobile-page-shell`), onde cards/KPIs e estados vazios não eram abrangidos por seletores anteriores.
- Estado desta revisão: implementada na branch do PR para QA visual manual; não integrada na main. A aprovação visual em diferentes larguras e temas continua pendente.


### Composição A do cabeçalho mobile — 27/11/2026

- Saudação/título à esquerda e botão de tema à direita na primeira linha.
- Mês abreviado + ano na linha seguinte, alinhado à esquerda; setas mínimas alinhadas à direita.
- Composição aplicada no PageHeader e MonthSelector partilhados para Dashboard, Movimentos e Relatórios.
- Rota Financeira mantém comportamento diferenciado: intervalo de 3 meses no desktop e mês único no mobile, sem duplicação.
- CI passou (Web CI e PR Quality Gate); validação visual manual do utilizador ainda pendente. Implementado na branch do PR #12, sem integração na main.


### Menu Mais mobile — refinamento transversal

- Corrigido estado selecionado simultâneo: quando Mais abre, a página subjacente não permanece destacada na bottom navigation.
- Reforçada a distinção do bottom sheet Mais com pega, borda superior teal, sombra e overlay/blur do conteúdo atrás.
- Cores de seleção da navegação passam a respeitar tokens de light/dark mode.
- Alteração na branch do PR #12; não integrada na main, pendente de QA visual manual.


### Padrão de cards financeiros e ícone Configurações

- Reutilizado o destaque verde do Dashboard nos resumos de saldo final da Rota Financeira (mobile), saldo total de Contas, total em dívida de Cartões e resumo da fatura selecionada.
- O padrão é aplicado por uma classe partilhada, com gradiente e cores explícitos que não mudam em dark mode. Não afeta cards secundários, listas ou tabelas.
- Ícone da página Configurações alterado de símbolo tipo sol para engrenagem, distinguindo-o do controlo de tema.
- Web CI e PR Quality Gate passaram no commit de implementação c4483165; QA visual manual pendente. Não integrada na main.

## Desktop visual consistency — PR #12

- Aprovada a proposta de desktop: sidebar alinhada à esquerda, cabeçalho e conteúdo mais compactos, melhor aproveitamento entre 1025 e 1199px.
- Implementação na branch feature/movements-write-flows: alinhamento da sidebar através de props dos primitives; geometria desktop por tokens partilhados; controlo de tema no PageHeader em todos os breakpoints; removido o botão duplicado do shell.
- Criada a variante partilhada orbe-financial-highlight-card no design system, aplicada ao saldo do Dashboard desktop/mobile e aos resumos financeiros aprovados. O tema escuro exclui esta variante das regras genéricas de superfície.
- Corrigidos os overrides important introduzidos na camada de polimento dos cards e removido o override duplicado do seletor de período da Rota Financeira.
- Finding legado: theme.css mantém 111 ocorrências `!important` preexistentes para superfícies, formulários e componentes mobile; navigation.css mantém 5 ocorrências de estados da navegação mobile. Impacto: a cascata é mais difícil de manter e estilos semânticos podem exigir exceções. Os seletores afetados pela sidebar desktop e pelo card de destaque foram corrigidos estruturalmente. Critério de remoção dos restantes: migrar cada componente afetado de estilos inline/hardcoded para tokens/classes semânticas e eliminar o override no mesmo PR de migração. base.css mantém 4 declarações no bloco prefers-reduced-motion, usadas como override de acessibilidade para respeitar a preferência do sistema. Não expandido para mobile nesta alteração desktop.
- Web CI (run 46012020608) e PR Quality Gate (run 46012020106) passaram no commit c4483165. QA visual manual em desktop e nos dois temas continua pendente; não integrado na main.

### QA visual — correção do painel de movimentos do dia

- Finding reportado durante QA: em dark mode, o bottom sheet mobile da Rota Financeira mantinha fundo claro enquanto textos e estados herdavam tokens escuros, causando baixo contraste.
- Causa: regra dark anterior estava condicionada ao ancestral `.main-content`; o modal mobile não garante esse ancestral.
- Corrigido em `theme.css` com superfície/foregrounds explícitos e estados de filtro/bordas theme-aware, sem alterar lógica ou markup funcional.
- Aguardar reteste visual do utilizador em dark mode; alteração na branch do PR #12, não integrada na main.

### QA visual — sidebar/menus dark mode

- Finding complementar: aplicar a mesma correção de contraste ao painel mobile “Mais” e ao popover de conta da sidebar desktop; não depender de herança do container principal porque o popover é renderizado em portal.
- Corrigido em `theme.css`: superfície opaca por token, foregrounds para textos/ícones, divisores, hover/focus e logout semânticos. Não altera navegação ou ações.
- QA visual manual em mobile e desktop, light/dark, pendente.

### QA visual — card de resumo em Movimentos

- Substituído o trio de KPIs independentes por um resumo financeiro no padrão de destaque partilhado: Resultado em primeiro plano e Ganhos/Gastos na linha inferior.
- A composição usa `orbe-financial-highlight-card` e estilos no design-system `financial-highlight.css`; removidos estilos antigos de KPI da página. Sem alteração no cálculo (operações realizadas, excluindo transferências) ou nos filtros.
- Pesquisa e filtros continuam depois do card. Testar responsividade e legibilidade nos dois temas antes do merge.

### Auditoria sistémica de dark mode — 27/11/2026

- Finding confirmado pelas capturas: formulário de Movimentos apresentava modal claro com input escuro em dark mode. Causa: portal + tokens de formulário estáticos inline + override global de input.
- Corrigido na camada partilhada: tokens do formulário ligados ao tema ativo; .orbe-input excluído do override global de input; superfícies, selected/hover/focus, botões, footer, backdrop e scrollbar harmonizados.
- Revisão de estilos em Dashboard, Movimentos, Rota, Contas, Cartões/Faturas, Relatórios, Configurações, navegação mobile/Mais e menus de conta; substituídos vários hardcodes de superfície por tokens semânticos e adicionados estados dark de contraste.
- Referência estética para menus/overlays: painel Mais — superfície opaca escura, borda/acento teal, texto claro, muted e tint de interação discreto. Dashboard balance highlight mantém gradiente verde aprovado.
- QA visual manual global ainda pendente. Critério: nenhuma superfície clara involuntária em dark; texto/ícones/placeholder/valores/estados legíveis; selected/hover/focus coerentes; modal/sheet/portal e scrollbar consistentes em light/dark e 320/768/1024/1025+ px.
- Não alterar lógica, dados, API ou navegação nesta auditoria.
### Formulários compactos — progressive disclosure e defaults negativos

- Criados no design system os componentes reutilizáveis OrbeDisclosure (secção recolhida por defeito, semântica nativa details/summary) e OrbeFormToggle (checkbox opt-in com label/descrição).
- Formulário de Movimentos simplificado: descrição, valor, categoria, conta (quando necessária) e data permanecem no fluxo principal; recorrência, estado pendente e detalhes da transferência ficam em disclosure.
- Princípio global registado: para decisões com impacto material, usar o estado mais seguro, reversível e de menor compromisso; não assumir consentimento/execução e exigir intenção explícita para avançar. Se faltar informação, não inferir nem executar.
- Movimentos de gasto/rendimento começam PENDENTES. O utilizador tem de ativar “Registar como realizado” para declarar que a operação já aconteceu; a conta só é exigida no estado realizado. Transferências começam com saída e entrada pendentes, cada uma com ação explícita “Registar ... como realizada”.
- Recorrência começa desligada. Data de fim e descrição opcional começam vazias. Ao ativar recorrência, o formulário mantém o estado conservador e não marca a operação como realizada.
- Seletores de categoria/conta/frequência passam a usar select nativo e acessível, evitando listas verticais extensas de opções. Estado vazio e seleção de destino dependente da origem têm mensagens explícitas.
- Datas e estados da transferência ficam recolhidos com resumo do valor predefinido; validações de data abrem automaticamente os detalhes. Erros de fim de recorrência abrem “Mais opções”.
- DateInput mantém apenas atalhos úteis Hoje/Ontem; removido “Escolher data” redundante, pois o input date já permite escolher.
- Sem mudança de API/payloads/regra de negócio. Contas e Cartões/Faturas ainda não dispõem de formulários de criação/edição nesta fase; o padrão fica pronto para reutilização quando esses fluxos forem implementados.
- CI executado no commit anterior passou; após esta correção de defaults, CI deve voltar a executar e QA manual de estados pendentes/realizados em light/dark e 320–1024+ px continua necessário antes do merge.

## Decisão aprovada — formulário completo de gasto (2026-11-27)

O fluxo visual completo foi aprovado pelo utilizador. **A interface está implementada no PR #12**; o modelo físico, serviços e contratos necessários para persistir todas as modalidades ainda precisam de ser implementados.

- Método: Conta ou Cartão; «A prazo» é modalidade, não método.
- Conta: modalidades Imediato, Data futura e Prestações. Conta prevista separada da conta efetiva; vencimento separado da data do gasto e da data efetiva de pagamento.
- Em prestações por Conta, permitir marcar primeira prestação já paga e recolher conta efetiva + data efetiva. O pagamento inicial liquida a prestação sem duplicar despesa.
- Cartão: cartão + compra única/parcelada + número de prestações. Faturas/vencimentos calculados pelo ciclo; sem vencimento manual e sem checkbox de primeira prestação paga no formulário.
- Contas e cartões são carregados das entidades reais do utilizador; não são usadas opções mockadas.
- As modalidades ainda sem suporte API ficam bloqueadas no submit, evitando persistência parcial ou perda silenciosa.

### Trabalho restante no backend
1. Atualizar modelo ER/UML e esquema físico para conta prevista, plano e prestações individuais.
2. Implementar serviços transacionais/idempotentes para plano parcelado e pagamento inicial opcional.
3. Alterar contratos API para gasto pendente com conta prevista e compra de cartão calculada pelo backend.
4. Persistir notas e distinguir data do gasto, vencimento e data efetiva.
5. Atualizar regras/read models de Movimentos, Contas, Cartões/Faturas e Rota Financeira.
6. Implementar testes de integridade, idempotência, arredondamento, ciclo do cartão e ausência de dupla contagem.
7. Ligar os contratos no frontend, remover os bloqueios das modalidades já suportadas e executar QA visual/funcional desktop, tablet e mobile.

Estado: UX aprovada; interface implementada no PR #12; integração financeira completa pendente.

---


## Estado atualizado — interface dos formulários de gastos e ganhos (27/11/2026)

**Interface implementada na branch `feature/movements-write-flows`; integração financeira completa ainda pendente.** Esta atualização substitui a indicação anterior de que o formulário ainda não tinha sido implementado. A documentação de UX aprovada permanece válida.

### Implementado na interface
- Gasto: Conta/Cartão; Conta com Imediato/Data futura/Prestações; quantidade e primeira prestação já paga; compra de cartão única/parcelada; campos de datas e contas contextualizados.
- Ganho: fluxo próprio recebido/pendente, sem seletor Conta/Cartão.
- Cartões e contas ativos provenientes do read model real.
- Notas opcionais no campo «Mais opções».
- Modalidades que ainda não têm contrato backend são bloqueadas na submissão, sem enviar payload incorreto nem simular persistência.
- Conta/Imediato e o fluxo existente de ganho continuam ligados aos endpoints já implementados.

### Pendências para tornar os formulários funcionais
1. **Modelo físico:** guardar conta prevista separada da conta efetiva; representar plano de prestações e vencimentos individuais; suportar compra de cartão e alocações automáticas; persistir notas.
2. **Serviços Laravel:** criação transacional/idempotente de plano e prestações; pagamento inicial opcional da primeira prestação; impedir duplicação de despesa e garantir valores/arredondamentos exatos.
3. **API:** ampliar contrato de gastos por Conta/Cartão e alterar criação de compras de cartão para receber cartão/data/quantidade, não alocações manuais de fatura; expor erros de validação por campo.
4. **Read models:** Movimentos mostra compra de cartão individual e prestações/obrigações no contexto correto; Contas mostra apenas efeitos realizados; Cartões/Faturas mostra compras alocadas e pagamentos; Rota Financeira projeta conta prevista e total de cada fatura uma única vez.
5. **Ganhos/notas:** adicionar persistência de notas sem alterar o fluxo próprio de receita; confirmar data prevista/efetiva no contrato e read model.
6. **Testes:** isolamento por utilizador, conta/cartão ativo, idempotência, atomicidade, arredondamento residual, ciclos de fatura, primeira prestação paga, sem dupla contabilização, projeção vs saldo real.
7. **Frontend final:** ligar os novos contratos, remover bloqueios de modalidades suportadas, atualizar o read model após sucesso e tratar 422/erros de servidor sem fechar o formulário.
8. **QA:** executar testes backend, Pint nos ficheiros alterados, ESLint, TypeScript/build e QA manual desktop/tablet/mobile + light/dark.

### Sequência
Modelo e migrations → serviços transacionais/testes → API e read models → ligar frontend/remover bloqueios → QA local → revisão do PR. Não integrar na `main` sem validação explícita.


### Formulário de transferência — simplificação (2026-11-27)
- Implementado diretamente na main: formulário com valor, conta de origem, conta de destino e observações opcionais.
- Submissão representa transferência efetiva; ambas as pernas são enviadas como REALIZED com a mesma data efetiva automática do dia do registo.
- Removidos do formulário os estados independentes, datas editáveis e programação de transferência. O suporte técnico/API preexistente para estados por perna não foi removido.
- O seletor de origem limpa o destino quando a origem selecionada passa a ser a mesma conta; o destino exclui a conta de origem.
- Documentação funcional atualizada em docs/02-regras-financeiras.md e docs/03-interface-e-formularios.md.
- CI e QA visual/responsiva após esta alteração ainda precisam ser verificados.
