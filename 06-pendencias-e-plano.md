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
| 7. Arquitetura detalhada e UML | Em análise |
| 8. Validação e plano de implementação | Por fazer |

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
| ARC-001 | Destino/referência dos lançamentos: referências específicas recomendadas; aprovação pendente | Recomendação apresentada |
| ARC-002 | Modelo físico, cardinalidades e constraints | Pendente |
| ARC-003 | Representação monetária, escala e arredondamento | Pendente |
| ARC-004 | Autenticação e sessões | Pendente |
| ARC-006 | Alojamento, deploy e ambientes | Pendente |
| ARC-007 | Scheduler, filas e processamento assíncrono | Em análise |
| ARC-008 | Testes, CI/CD, backup e recuperação | Pendente |

## ARC-001 — conclusão da comparação
Foram comparadas:
- Referências específicas a conta, fatura e dívida, com FKs próprias e constraint de destino único.
- Associação polimórfica `destination_type + destination_id`, sem FK SQL direta para as várias tabelas.
- Superentidade `financial_destinations`, com FK do lançamento para a identidade genérica e relações para as especializações.

**Recomendação técnica:** referências específicas. A opção polimórfica foi desaconselhada para o núcleo financeiro por não garantir a existência do destino através de FK nativa. A superentidade preserva uma FK, mas acrescenta complexidade e não garante, isoladamente, a existência de exatamente uma especialização válida.

**Aprovação do utilizador ainda necessária.** Consultar a análise completa e as fontes em [05 — Arquitetura e UML](05-arquitetura-e-uml.md), secção ARC-001.

## Trabalho funcional pendente
- Desenhar subpáginas de Contas, Cartões e Dívidas.
- Desenhar detalhes e faturas de cartão.
- Desenhar detalhes de dívida e pagamentos.
- Definir modais de adicionar, editar, cancelar, reverter e confirmar.
- Definir formulários, validações e ações permitidas por estado/dependência.
- Auditar consistência e reaproveitamento de componentes.

Ordem aprovada: páginas principais; subpáginas; modais; auditoria final.

## Próxima sequência recomendada
1. Aprovar ou rejeitar a recomendação ARC-001.
2. Fechar modelo conceptual e UML.
3. Definir modelo físico, precisão monetária e transações.
4. Desenhar subpáginas e modais sem alterar páginas principais aprovadas.
5. Definir autenticação, alojamento, testes, segurança, deploy e recuperação.
6. Rever e aprovar a especificação e o plano de implementação.

## Critério para iniciar implementação estrutural
Não iniciar antes de fechar destino dos lançamentos, aprovar arquitetura/UML, definir precisão monetária e integridade transacional, especificar fluxos críticos, concluir interfaces da primeira fase e definir critérios de aceitação/testes.

Protótipos ou experiências técnicas isoladas só devem avançar com autorização explícita e não constituem arquitetura aprovada.

## Atualização de decisões
Ao fechar uma decisão, atualizar o documento de origem, o estado nesta lista e os requisitos/diagramas afetados. Registar motivo e impacto quando substituir uma decisão. Não criar atas separadas por conversa.