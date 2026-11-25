# Orbe — Aplicação de gestão financeira pessoal

O Orbe é uma aplicação de gestão financeira pessoal. Este repositório contém o código da aplicação e a documentação funcional e técnica do projeto.

## Estrutura do repositório

- `backend/` — implementação do backend.
- `web/` — implementação da aplicação web.
- `docs/` — documentação funcional, financeira, de arquitetura, interfaces e desenvolvimento.

A documentação é a referência para produto, design, desenvolvimento e validação. Antes de alterar funcionalidades, consultar os documentos relevantes e respeitar as decisões aprovadas.

## Como navegar

1. Ler [AGENTS.md](AGENTS.md) antes de executar trabalho neste projeto.
2. Consultar as regras financeiras antes de alterar qualquer fluxo que afete dinheiro, saldos, cartões, dívidas ou projeções.
3. Consultar interfaces antes de alterar páginas ou navegação.
4. Consultar arquitetura/UML e o [modelo ER](docs/07-modelo-er.md) antes de alterar entidades, persistência ou serviços.
5. Verificar pendências antes de assumir decisões ainda não aprovadas.

## Documentos

A documentação está organizada por domínio. Consultar o documento correspondente e atualizar a fonte existente; **não criar ficheiros para cada página, contrato, caso ou etapa**.

| Documento | Conteúdo |
|---|---|
| [01 — Produto e funcionalidades](docs/01-produto-e-funcionalidades.md) | Âmbito, requisitos, operações e critérios de aceitação |
| [02 — Regras financeiras](docs/02-regras-financeiras.md) | Invariantes, cálculos, estados financeiros e projeções |
| [03 — Interface e formulários](docs/03-interface-e-formularios.md) | Navegação, páginas, padrões visuais e comportamento dos formulários |
| [04 — Arquitetura, modelo e auditoria](docs/04-arquitetura-modelo-e-auditoria.md) | Stack, arquitetura, UML, ER, integridade e auditoria técnica |
| [05 — Estado e plano](docs/05-estado-e-plano.md) | Implementação, pendências, decisões abertas, validações e sequência de trabalho |
| [06 — Contratos da API](docs/06-contratos-api.md) | Contratos de operações, transferências e recorrências |

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


