# Orbe — Especificação do produto

O Orbe é uma aplicação de gestão financeira pessoal. Este repositório é a referência funcional e técnica para produto, design, desenvolvimento e validação; não contém a implementação da aplicação.

## Como navegar
1. Ler [AGENTS.md](AGENTS.md) antes de executar trabalho neste projeto.
2. Consultar as regras financeiras antes de alterar qualquer fluxo que afete dinheiro, saldos, cartões, dívidas ou projeções.
3. Consultar interfaces antes de alterar páginas ou navegação.
4. Consultar arquitetura/UML e o [modelo ER](07-modelo-er.md) antes de alterar entidades, persistência ou serviços.
5. Verificar pendências antes de assumir decisões ainda não aprovadas.

## Documentos
| Ficheiro | Conteúdo |
|---|---|
| [01-visao-geral.md](01-visao-geral.md) | Produto, âmbito, plataformas e princípios |
| [02-regras-financeiras.md](02-regras-financeiras.md) | Modelo financeiro, invariantes e cálculos |
| [03-funcionalidades-e-operacoes.md](03-funcionalidades-e-operacoes.md) | Operações, estados, ações e aceitação |
| [04-interfaces-e-navegacao.md](04-interfaces-e-navegacao.md) | Páginas aprovadas e navegação |
| [05-arquitetura-e-uml.md](05-arquitetura-e-uml.md) | Arquitetura, decisões e UML |
| [06-pendencias-e-plano.md](06-pendencias-e-plano.md) | Decisões abertas e sequência de trabalho |
| [07-modelo-er.md](07-modelo-er.md) | Entidades, relações, regras de integridade e objetivos de leitura por página |

## Estado das decisões
- **Aprovado:** confirmado pelo responsável do produto.
- **Em análise:** proposta ainda não aprovada.
- **Pendente:** decisão necessária.
- **Substituído:** decisão anterior que deixou de vigorar.

Uma proposta técnica não se torna requisito aprovado apenas por estar documentada. Decisões pendentes devem permanecer identificadas.

## Manutenção
Manter a documentação concisa, verificável e sem duplicação. Cada regra tem uma localização principal. Quando uma decisão mudar, atualizar o documento de origem e as referências afetadas no mesmo conjunto de alterações.

## Estado atual
Fundamentos, modelo financeiro, comportamento das operações, páginas principais, stack, monorepo e ARC-001 estão aprovados. O modelo ER conceptual foi atualizado para refletir o saldo inicial de cartão integralmente distribuído por faturas, correções, reversões e pagamentos multi-fatura; ARC-002 continua pendente de validação e aprovação documental. O modelo físico e migrations não estão aprovados. Permanecem decisões de produto sobre estimativas variáveis e alguns estados/apresentações.