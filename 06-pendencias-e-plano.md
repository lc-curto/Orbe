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
| 8. Modelo ER conceptual (ARC-002) | Proposta consolidada; aprovação documental pendente |
| 9. UML complementar e modelo físico | Por fazer |
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
| ARC-002 | Aprovar documentalmente o modelo ER conceptual consolidado e fechar cardinalidades | Aprovação pendente |
| ARC-003 | Representação monetária, escala e arredondamento | Pendente |
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

**Estado:** proposta conceptual consolidada após validação dos fluxos de compra parcelada, obrigações em períodos `PLANNED`, pagamento/alocação de faturas, planos vencidos, exposição inicial, unicidade de ciclo `OPEN`, transferências e reembolsos. Aguarda aprovação documental explícita. Não iniciar migrations com base neste desenho.

## Decisões de produto ainda pendentes
Estas decisões não reabrem o núcleo financeiro; devem ser aprovadas antes de especificar os comportamentos finais correspondentes.

| Tema | Decisão pendente |
|---|---|
| Planos de fatura vencidos | Se existe débito automático ou reagendamento automático após o vencimento; sem aprovação, não inventar nova data. |
| Exposição inicial de cartão | Se a parte `UNALLOCATED` pode permanecer sem distribuição por tempo indeterminado. |
| Alocação de pagamentos iniciais | FIFO por ciclo mais antigo como padrão recomendado ou escolha manual obrigatória/disponível. |
| Faturas anteriores | Como apresentar faturas de ciclos anteriores que continuam com obrigação em aberto. |
| Compra no dia do fecho | Regra de atribuição ao ciclo quando a compra ocorre na data de fecho. |
| Crédito negativo de fatura | Se é permitido, como transita para ciclos seguintes e em que condições pode ser devolvido à conta. |
| Estimativa variável da Rota | Categorias iniciais, janela histórica, fórmula, distribuição diária e comunicação de dados `UNCLASSIFIED`. |
| Moeda e precisão | Escala, arredondamento e se a moeda principal pode mudar depois de existirem movimentos. |

**Nota de consistência a resolver no modelo ER:** a representação da exposição inicial não distribuída deve continuar compatível com a fonte de verdade financeira e com ARC-001. Não criar uma fonte paralela de dívida nem inventar uma fatura artificial. O destino/relação contabilística dessa exposição deve ficar explícito antes do modelo físico.

## Trabalho funcional pendente
- Desenhar subpáginas de Contas, Cartões e Dívidas.
- Desenhar detalhes e faturas de cartão.
- Desenhar detalhes de dívida e pagamentos.
- Definir modais de adicionar, editar, cancelar, reverter e confirmar.
- Definir formulários, validações e ações permitidas por estado/dependência.
- Auditar consistência e reaproveitamento de componentes.

Ordem aprovada: páginas principais; subpáginas; modais; auditoria final.

## Próxima sequência recomendada
1. Rever e aprovar documentalmente o modelo ER conceptual consolidado (ARC-002), incluindo a ressalva da exposição inicial não distribuída.
2. Produzir UML de domínio, sequências e máquinas de estado dos fluxos críticos.
3. Fechar decisões de produto que condicionam cartões, faturas e estimativas da Rota.
4. Definir modelo físico, constraints, precisão monetária, transações e estratégia de concorrência.
5. Desenhar subpáginas e modais sem alterar páginas principais aprovadas.
6. Definir autenticação, alojamento, testes, segurança, deploy e recuperação.
7. Rever e aprovar a especificação e o plano de implementação.

## Critério para iniciar implementação estrutural
Não iniciar antes de aprovar arquitetura/UML, definir precisão monetária e integridade transacional, especificar fluxos críticos, concluir interfaces da primeira fase e definir critérios de aceitação/testes.

Protótipos ou experiências técnicas isoladas só devem avançar com autorização explícita e não constituem arquitetura aprovada.

## Atualização de decisões
Ao fechar uma decisão, atualizar o documento de origem, o estado nesta lista e os requisitos/diagramas afetados. Registar motivo e impacto quando substituir uma decisão. Não criar atas separadas por conversa.