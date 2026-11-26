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
- Não introduzir microserviços, Redis ou Elasticsearch sem necessidade demonstrada e decisão aprovada.

## Processo de implementação
1. Indicar os requisitos que a tarefa satisfaz.
2. Explicar o diagnóstico antes de alterar código, sobretudo ao corrigir defeitos.
3. Delimitar ficheiros, módulos e efeitos esperados.
4. Implementar a alteração mínima coerente com a arquitetura.
5. Testar fluxos normais, limites, estados e regressões.
6. Informar alterações, testes executados e pontos não validados.

## Critérios de conclusão
Compilar não significa estar concluído. A tarefa deve cumprir critérios de aceitação, preservar invariantes financeiras, passar testes relevantes e não introduzir regressões conhecidas.

## Documentação e segurança
Atualizar a documentação quando decisões aprovadas mudarem. Manter IDs estáveis e marcar decisões antigas como substituídas. Nunca versionar credenciais, tokens, dados bancários reais ou informação pessoal sensível. Usar dados fictícios nos exemplos.


## Frontend Web

Seguir o padrão frontend definido em [docs/04-arquitetura-modelo-e-auditoria.md](docs/04-arquitetura-modelo-e-auditoria.md#frontend-web). A referência visual define UI e comportamento, não a estrutura do código. Novas páginas devem separar composição, apresentação e lógica derivada, reutilizar o design system e evitar refatorações fora do escopo.