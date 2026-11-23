# 06 — Pendências e plano

Registo central do que falta decidir ou especificar. Uma decisão só passa a aprovada após confirmação explícita.

## Estado das etapas
| Etapa | Estado |
|---|---|
| 1. Fundamentos do produto | Aprovada |
| 2. Modelo financeiro e regras | Aprovada |
| 3. Comportamento das operações | Aprovada |
| 4. Páginas principais | Aprovada |
| 5. UML e arquitetura | Em análise |
| 6. Validação e plano de implementação | Por fazer |

## Decisões técnicas pendentes
| ID | Decisão | Estado |
|---|---|---|
| ARC-001 | Destino/referência dos lançamentos: específica ou genérica | Pendente |
| ARC-002 | Tecnologia mobile: Flutter ou React Native | Pendente |
| ARC-003 | Modelo físico, cardinalidades e constraints | Pendente |
| ARC-004 | Representação monetária, escala e arredondamento | Pendente |
| ARC-005 | Autenticação e sessões | Pendente |
| ARC-006 | Alojamento, deploy e ambientes | Pendente |
| ARC-007 | Scheduler, filas e processamento assíncrono | Em análise |
| ARC-008 | Backup e recuperação | Pendente |

## Trabalho funcional pendente
- Desenhar subpáginas de Contas, Cartões e Dívidas.
- Desenhar detalhes e faturas de cartão.
- Desenhar detalhes de dívida e pagamentos.
- Definir modais de adicionar, editar, cancelar, reverter e confirmar.
- Definir formulários, validações e ações permitidas por estado/dependência.
- Auditar consistência e reaproveitamento de componentes.

Ordem aprovada: páginas principais; subpáginas; modais; auditoria final.

## Próxima sequência recomendada
1. Resolver ARC-001.
2. Comparar e decidir ARC-002.
3. Fechar modelo conceptual e UML.
4. Definir modelo físico, precisão monetária e transações.
5. Desenhar subpáginas e modais sem alterar páginas principais aprovadas.
6. Definir testes, segurança, deploy e recuperação.
7. Rever e aprovar a especificação e o plano de implementação.

## Critério para iniciar implementação estrutural
Não iniciar antes de fechar destino dos lançamentos, aprovar arquitetura/UML, definir precisão monetária e integridade transacional, especificar fluxos críticos, concluir interfaces da primeira fase e definir critérios de aceitação/testes.

Protótipos ou experiências técnicas isoladas só devem avançar com autorização explícita e não constituem arquitetura aprovada.

## Atualização de decisões
Ao fechar uma decisão, atualizar o documento de origem, o estado nesta lista e os requisitos/diagramas afetados. Registar motivo e impacto quando substituir uma decisão. Não criar atas separadas por conversa.