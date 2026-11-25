# 06 — Pendências e plano

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

A comparação e a fundamentação estão documentadas em [05 — Arquitetura e UML](05-arquitetura-e-uml.md), secção ARC-001.

## ARC-002 — proposta de modelo ER
Foi criado [07 — Modelo ER](07-modelo-er.md), que contém:
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
- Concluir/validar a interface de leitura de Contas e Cartões/faturas já implementada; os formulários de escrita continuam pendentes.
- Concluir a Rota Financeira: a interface frontend inicial já existe; falta contrato/read model de projeção, saldo diário e classificação fixa/variável. Dívidas, Relatórios e Configurações continuam placeholders.
- Definir detalhes de dívida e pagamentos, incluindo os contratos funcionais ainda pendentes.
- Definir modais/formulários de adicionar, editar, cancelar, reverter e confirmar conforme os contratos disponíveis.
- Definir validações e ações permitidas por estado/dependência.
- Validar navegação responsiva, FAB contextual, painel Mais, safe areas e comportamento do `AppShell`.
- Auditar consistência e reaproveitamento de componentes.

Ordem de execução atualizada: validar a navegação e as páginas de leitura já implementadas; fechar contratos/read models pendentes; implementar páginas-placeholder e formulários; executar auditoria final.

## Estado da implementação frontend — 2026-11-25

- PR #3: página Contas em modo de leitura publicada na `main`.
- PR #4: página Cartões e detalhe de faturas em modo de leitura publicados na `main`.
- PR #5: navegação responsiva, painel Mais e FAB global contextual publicados na `main` (merge commit `6b6efea51122de0d648ece393d7cc2e6a82e0f73`).
- Movimentos/Programações: leitura implementada; os formulários de programação continuam indisponíveis.
- Rota Financeira: interface frontend inicial implementada na branch `feature/financial-route-page`; dados realizados agregados a partir do read model atual. Saldo diário/projeção e classificação fixa/variável continuam indisponíveis. Dívidas, Relatórios e Configurações permanecem placeholders.
- As opções Nova conta, Novo cartão, Nova dívida, Nova programação e Nova projeção no FAB comunicam indisponibilidade enquanto faltarem formulários/contratos; não criam registos fictícios.
- Relatórios e Configurações não apresentam FAB porque não têm ação de criação.
- O estado de implementação não equivale a validação final: os testes responsivos e a auditoria frontend permanecem pendentes no cronograma.

## Próxima sequência recomendada
1. Validar navegação responsiva e `AppShell` em desktop, tablet e mobile.
2. Validar páginas de leitura e consumo de dados reais, incluindo loading, erro, vazio e isolamento por utilizador.
3. Fechar decisões/contratos de produto que condicionam cartões, faturas, Rota e Dívidas.
4. Implementar páginas-placeholder e formulários apenas com contratos confirmados.
5. Executar testes de aceitação e auditoria de consistência documentação/frontend/API/modelo de domínio.

## Critério para novas alterações estruturais
A implementação estrutural do frontend e do núcleo já está em curso e tem entregas publicadas na `main`. Para novas alterações estruturais, continuam obrigatórios: arquitetura/UML aprovada, precisão monetária e integridade transacional definidas, fluxos críticos especificados e critérios de aceitação/testes identificados. Não interpretar uma entrega parcial como aprovação de contratos ou funcionalidades ainda pendentes.

Protótipos ou experiências técnicas isoladas só devem avançar com autorização explícita e não constituem arquitetura aprovada.

## Atualização de decisões
Ao fechar uma decisão, atualizar o documento de origem, o estado nesta lista e os requisitos/diagramas afetados. Registar motivo e impacto quando substituir uma decisão. Não criar atas separadas por conversa.
