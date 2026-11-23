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
| 8. Arquitetura detalhada e UML | Em análise |
| 9. Validação e plano de implementação | Por fazer |

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
| ARC-002 | Modelo físico, cardinalidades e constraints | Pendente |
| ARC-003 | Representação monetária, escala e arredondamento | Pendente |
| ARC-004 | Autenticação e sessões | Pendente |
| ARC-006 | Alojamento, deploy e ambientes | Pendente |
| ARC-007 | Scheduler, filas e processamento assíncrono | Em análise |
| ARC-008 | Testes, CI/CD, backup e recuperação | Pendente |

## ARC-001 — decisão aprovada
**Alternativa A: referências específicas.** Cada lançamento terá exatamente um destino, referenciado por uma FK específica para conta, fatura ou dívida/obrigação. A regra de destino único deverá ser protegida por `CHECK` constraint e testes. A decisão não fecha ainda todos os detalhes do modelo físico.

A comparação e a fundamentação estão documentadas em [05 — Arquitetura e UML](05-arquitetura-e-uml.md), secção ARC-001.

## Trabalho funcional pendente
- Desenhar subpáginas de Contas, Cartões e Dívidas.
- Desenhar detalhes e faturas de cartão.
- Desenhar detalhes de dívida e pagamentos.
- Definir modais de adicionar, editar, cancelar, reverter e confirmar.
- Definir formulários, validações e ações permitidas por estado/dependência.
- Auditar consistência e reaproveitamento de componentes.

Ordem aprovada: páginas principais; subpáginas; modais; auditoria final.

## Próxima sequência recomendada
1. Fechar o modelo conceptual e UML, incorporando ARC-001.
2. Definir modelo físico, precisão monetária e transações.
3. Desenhar subpáginas e modais sem alterar páginas principais aprovadas.
4. Definir autenticação, alojamento, testes, segurança, deploy e recuperação.
5. Rever e aprovar a especificação e o plano de implementação.

## Critério para iniciar implementação estrutural
Não iniciar antes de aprovar arquitetura/UML, definir precisão monetária e integridade transacional, especificar fluxos críticos, concluir interfaces da primeira fase e definir critérios de aceitação/testes.

Protótipos ou experiências técnicas isoladas só devem avançar com autorização explícita e não constituem arquitetura aprovada.

## Atualização de decisões
Ao fechar uma decisão, atualizar o documento de origem, o estado nesta lista e os requisitos/diagramas afetados. Registar motivo e impacto quando substituir uma decisão. Não criar atas separadas por conversa.