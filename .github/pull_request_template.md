## Objetivo e âmbito
<!-- O que esta PR resolve? Quais requisitos/decisões aprovadas suporta? -->

## Diagnóstico e implementação
<!-- Problema identificado, abordagem e ficheiros/áreas afetadas. -->

## Refatoração oportuna — checklist obrigatório
A política e os Gates A/B/C de `AGENTS.md` aplicam-se a todas as PRs. Não deixar itens vazios.

- [ ] Inspecionei os padrões existentes no módulo e os documentos técnicos aplicáveis.
- [ ] Avaliei duplicação, estado derivável, acoplamento, responsabilidades, APIs obsoletas e violações da stack.
- [ ] Corrigi os problemas locais, relacionados e de baixo risco encontrados; qualquer exceção está registada abaixo.
- [ ] Reutilizei componentes, serviços, tokens e padrões existentes quando adequados.
- [ ] Não introduzi abstração, dependência, override ou arquitetura sem justificação; qualquer exceção está registada abaixo.
- [ ] Findings não corrigidos estão registados com motivo, impacto, dependência e critério de aceitação (ou indique “Nenhum” abaixo).
- [ ] Revisei o diff final à procura de código/estilos duplicados, alterações incidentais e inconsistências.
- [ ] Pesquisei `!important` no CSS alterado: não introduzi ocorrências; qualquer exceção é último recurso, justificada no código e descrita abaixo.

**Findings adiados / exceções (escrever “Nenhum” se não existirem):**
<!-- Área/ficheiro | motivo e risco | item de trabalho/critério de conclusão -->

## Validação
- [ ] Testes relevantes executados ou explicitamente assinalados como pendentes/não aplicáveis, com motivo
- [ ] Lint executado ou explicitamente assinalado como pendente/não aplicável, com motivo
- [ ] TypeScript/build executado ou explicitamente assinalado como pendente/não aplicável, com motivo
- [ ] QA visual/responsiva e estados relevantes executados ou explicitamente assinalados como pendentes/não aplicáveis, com motivo
- [ ] Documentação atualizada (ou justificação de não aplicabilidade)

**Comandos e resultados:**
<!-- Não declarar testes que não foram executados. -->

**Validações não executadas / limitações:**
<!-- Explicar claramente. -->

## Impacto e segurança
- [ ] Sem alteração não aprovada de comportamento, contrato API, regra financeira ou arquitetura
- [ ] Sem dados fictícios apresentados como dados reais
- [ ] Sem credenciais, tokens ou dados pessoais sensíveis
