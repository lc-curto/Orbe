# Orbe — Especificação do produto

O Orbe é uma aplicação de gestão financeira pessoal. Este repositório é a referência funcional e técnica para produto, design, desenvolvimento e validação; não contém a implementação da aplicação.

## Como navegar
1. Ler [AGENTS.md](AGENTS.md) antes de executar trabalho neste projeto.
2. Consultar as regras financeiras antes de alterar qualquer fluxo que afete dinheiro, saldos, cartões, dívidas ou projeções.
3. Consultar interfaces antes de alterar páginas ou navegação.
4. Consultar arquitetura/UML e o [modelo ER](docs/07-modelo-er.md) antes de alterar entidades, persistência ou serviços.
5. Verificar pendências antes de assumir decisões ainda não aprovadas.

## Documentos
| Ficheiro | Conteúdo |
|---|---|
| [ESPECIFICACAO_FORMULARIOS.md](docs/ESPECIFICACAO_FORMULARIOS.md) | Formulários, modais, validações e interações frontend |
| [01-visao-geral.md](docs/01-visao-geral.md) | Produto, âmbito, plataformas e princípios |
| [02-regras-financeiras.md](docs/02-regras-financeiras.md) | Modelo financeiro, invariantes e cálculos |
| [03-funcionalidades-e-operacoes.md](docs/03-funcionalidades-e-operacoes.md) | Operações, estados, ações e aceitação |
| [04-interfaces-e-navegacao.md](docs/04-interfaces-e-navegacao.md) | Páginas aprovadas e navegação |
| [05-arquitetura-e-uml.md](docs/05-arquitetura-e-uml.md) | Arquitetura, decisões e UML |
| [06-pendencias-e-plano.md](docs/06-pendencias-e-plano.md) | Decisões abertas e sequência de trabalho |
| [07-modelo-er.md](docs/07-modelo-er.md) | Entidades, relações, regras de integridade e objetivos de leitura por página |
| [08-cronograma-e-estado.md](docs/08-cronograma-e-estado.md) | Cronograma de implementação e checklist de estado |
| [09-auditoria-backend-e-nucleo.md](docs/09-auditoria-backend-e-nucleo.md) | Cobertura do ER pelo backend e lacunas de implementação |
| [10-contrato-operacoes-base.md](docs/10-contrato-operacoes-base.md) | Contrato mínimo de contas, categorias, despesas e receitas |
| [11-contrato-transferencias.md](docs/11-contrato-transferencias.md) | Contrato mínimo de transferências |

## Estado das decisões
- **Aprovado:** confirmado pelo responsável do produto.
- **Em análise:** proposta ainda não aprovada.
- **Pendente:** decisão necessária.
- **Substituído:** decisão anterior que deixou de vigorar.

Uma proposta técnica não se torna requisito aprovado apenas por estar documentada. Decisões pendentes devem permanecer identificadas.

## Manutenção
Manter a documentação concisa, verificável e sem duplicação. Cada regra tem uma localização principal. Quando uma decisão mudar, atualizar o documento de origem e as referências afetadas no mesmo conjunto de alterações.

## Estado atual
Fundamentos, modelo financeiro, comportamento das operações, páginas principais, stack, monorepo e ARC-001 estão aprovados. O modelo ER conceptual (ARC-002), o UML complementar e o modelo físico do núcleo financeiro estão aprovados; o núcleo usa migrations versionadas e `DECIMAL(19,4)`. Permanecem decisões de produto sobre estimativas variáveis, alguns estados/apresentações e módulos conceptuais ainda sem migrations.
