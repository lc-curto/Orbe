# Instruções para agentes de IA e colaboradores

Estas instruções aplicam-se a qualquer trabalho neste repositório e, quando copiadas para o repositório de implementação, a qualquer agente que altere o código do Orbe.

## Antes de trabalhar
1. Ler este ficheiro e README.md.
2. Identificar requisitos relevantes nos documentos funcionais.
3. Consultar docs/05-estado-e-plano.md para confirmar o estado das decisões.
4. Se uma decisão estiver pendente ou em análise, não escolher silenciosamente uma alternativa. Explicar a lacuna e pedir decisão se bloquear o trabalho.

## Regras obrigatórias
- Não inventar requisitos, fluxos, campos, estados ou permissões.
- Não transformar sugestões técnicas em decisões de produto.
- Não alterar comportamento aprovado sem autorização explícita.
- Não criar funcionalidades fora do âmbito.
- Não duplicar regras financeiras em módulos diferentes; respeitar o motor financeiro central.
- Não criar efeitos artificiais para corrigir diferenças ou facilitar cálculos.
- Não apagar nem alterar silenciosamente operações com efeitos confirmados.
- Não tratar pendentes ou projeções como movimentos efetivos.
- Não duplicar despesas no pagamento de faturas ou obrigações.
- Preservar relações e histórico entre operações, lançamentos e correções.
- Reutilizar componentes existentes quando respeitem a especificação.
- **CSS `!important`: o utilizador rejeita fortemente o seu uso. É proibido usá-lo como solução de layout, especificidade ou arquitetura. Só pode ser usado como último recurso, após avaliar e documentar por que não resolvem a causa a ordem/camada dos estilos, especificidade, escopo ou correção estrutural. Toda nova ocorrência exige justificação explícita no código/PR; não introduzir nem manter ocorrências estruturais sem finding e plano de remoção. Antes de concluir, pesquisar e rever todas as ocorrências no âmbito alterado.**
- Não introduzir microserviços, Redis ou Elasticsearch sem necessidade demonstrada e decisão aprovada.

## Processo obrigatório de implementação
1. Indicar os requisitos que a tarefa satisfaz.
2. Explicar o diagnóstico antes de alterar código, sobretudo ao corrigir defeitos.
3. Delimitar ficheiros, módulos e efeitos esperados.
4. **Executar a verificação obrigatória de refatoração oportuna** descrita abaixo antes de começar e novamente antes de concluir.
5. Implementar a alteração mínima coerente com a arquitetura e as boas práticas atuais da stack.
6. Testar fluxos normais, limites, estados e regressões.
7. Informar alterações, testes executados e pontos não validados, incluindo o resultado explícito da verificação de refatoração.

## Regra obrigatória — refatoração oportuna e conformidade com a stack

Esta regra aplica-se a **todas as tarefas**, sem depender de o utilizador a mencionar, a todos os agentes, colaboradores, PRs, correções, features e alterações de documentação/código. Não é uma sugestão nem uma preferência opcional.

### Gate A — antes de editar
- Inspecionar o código e os padrões existentes no módulo afetado; não decidir apenas pelo ficheiro isolado.
- Identificar duplicação, lógica derivável guardada como estado, responsabilidades misturadas, acoplamento, abstrações desnecessárias, estilos/tokens contraditórios, APIs obsoletas, problemas de acessibilidade/segurança e violações das convenções da stack.
- Consultar as regras técnicas aplicáveis em `docs/04-arquitetura-modelo-e-auditoria.md`, as regras de UI em `docs/03-interface-e-formularios.md`, o README da aplicação e a documentação oficial da versão efetivamente instalada quando houver dúvida sobre uma API ou prática.
- Registar mentalmente ou no plano da tarefa quais os problemas locais que serão corrigidos e quais não podem ser corrigidos com segurança.

### Gate B — durante a implementação
- Corrigir na mesma alteração os problemas evidentes, locais, diretamente relacionados e de baixo risco, em vez de copiar ou perpetuar o padrão inadequado.
- Preferir refatoração pequena, testável e sem mudança de comportamento: extrair função/componente/hook quando há responsabilidade real, eliminar duplicação, reutilizar primitives/tokens, simplificar fluxo e remover código morto.
- Não introduzir abstrações genéricas, dependências, camadas ou padrões arquiteturais sem necessidade concreta demonstrável.
- Não alterar contratos API, regras de domínio/financeiras, comportamento aprovado, esquema de dados ou arquitetura por iniciativa própria.
- Se a correção exigir alteração ampla, mudança de comportamento, migração ou decisão pendente: **não a improvisar**. Isolar o problema, explicar o risco e criar/atualizar um item de trabalho explícito com ficheiros/área, motivo, impacto, critério de aceitação e dependência. A tarefa atual não pode afirmar que a área está plenamente conforme enquanto esse item estiver aberto.
- “Fora do escopo” não é motivo suficiente para ignorar um problema local simples; é motivo válido para separar uma mudança estrutural ou de risco.

### Gate C — antes de concluir / abrir ou atualizar PR
Executar e reportar todos os pontos:
- [ ] A alteração segue a arquitetura e as boas práticas da stack e versões do projeto.
- [ ] Não introduz duplicação, estado derivável, lógica de domínio na UI ou acoplamento novo evitável.
- [ ] Reutiliza componentes, serviços, tokens, validações e padrões existentes quando adequados.
- [ ] Refatorações locais seguras identificadas foram feitas; exceções estão justificadas e registadas.
- [ ] Não há APIs/dependências obsoletas introduzidas, warnings relevantes ignorados ou supressões de lint sem justificação.
- [ ] Testes, lint e build aplicáveis foram executados; cada validação não executada está declarada.
- [ ] A documentação e os itens de trabalho foram atualizados quando necessário.
- [ ] O diff foi revisto para alterações incidentais, duplicação e consistência com o restante módulo.

**Bloqueio de conclusão:** não declarar tarefa/PR concluído se um gate foi ignorado, se existe finding relevante não registado ou se a validação foi alegada sem execução. Se não for possível cumprir, declarar estado parcial e o bloqueio concreto.

**Enforcement:** o template `.github/pull_request_template.md` torna a revisão explícita e o workflow `.github/workflows/pr-quality-gate.yml` bloqueia PRs cuja descrição não contenha as secções obrigatórias ou tenha checkboxes por concluir. O CI técnico (lint/build/testes) é uma barreira separada; checklist preenchida não substitui execução nem prova visual. Para N/A/pendente, marcar a conclusão de reporte e explicar a condição no corpo da PR; nunca afirmar um teste não executado.\n\n## Boas práticas por stack
- **Laravel/PHP:** seguir estrutura e convenções Laravel 13; validação de entrada via Form Requests/validação apropriada; autorização via policies/gates; regras de domínio fora de controllers; transações para operações atómicas; Eloquent sem N+1; tipos/retornos claros; Pint e testes relevantes. Não duplicar regras financeiras.
- **React/TypeScript/Vite:** componentes focados; hooks segundo Rules of Hooks; renderização pura; estado mínimo e derivação em funções/hooks testáveis; props e tipos explícitos; evitar `any`, casts/supressões injustificados e efeitos para calcular dados derivados; sem duplicar desktop/mobile além do necessário; ESLint, TypeScript e build.
- **HTML/CSS/design system:** HTML semântico e acessível; reutilizar primitives e tokens; spacing/layout com escala central; estilos locais apenas para exceções justificadas; evitar overrides contraditórios e valores arbitrários repetidos. Aplicar obrigatoriamente a política de `!important` acima: último recurso, justificação explícita, nunca como mecanismo de arquitetura. Validar breakpoints, overflow, foco, tema e safe areas.
- **MySQL:** respeitar constraints, FKs, precisão monetária e integridade; migrations reversíveis quando aplicável; índices orientados a consultas; nunca usar float/double em dinheiro.
- **Expo/React Native (quando implementado):** seguir APIs e convenções da versão instalada, componentes nativos e acessibilidade; não importar componentes visuais Web para mobile nem adicionar bibliotecas sem justificação.

A documentação técnica da stack não substitui as decisões aprovadas do Orbe. Em conflito, preservar primeiro os requisitos/invariantes do produto e pedir decisão quando necessário.

## Critérios de conclusão
Compilar não significa estar concluído. A tarefa deve cumprir critérios de aceitação, preservar invariantes financeiras, passar testes relevantes e não introduzir regressões conhecidas.

## Documentação e segurança
Atualizar a documentação quando decisões aprovadas mudarem. Manter IDs estáveis e marcar decisões antigas como substituídas. Nunca versionar credenciais, tokens, dados bancários reais ou informação pessoal sensível. Usar dados fictícios nos exemplos.


## Frontend Web

Seguir o padrão frontend definido em [docs/04-arquitetura-modelo-e-auditoria.md](docs/04-arquitetura-modelo-e-auditoria.md#frontend-web). A referência visual define UI e comportamento, não a estrutura do código. Novas páginas devem separar composição, apresentação e lógica derivada e reutilizar o design system. A refatoração oportunista local segura é obrigatória; não ignorar problemas simples por estarem fora do pedido. Aplicar os Gates A/B/C acima e não concluir trabalho com findings relevantes omitidos.