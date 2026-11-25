# Instruções para agentes de IA e colaboradores

Estas instruções aplicam-se a qualquer trabalho neste repositório e, quando copiadas para o repositório de implementação, a qualquer agente que altere o código do Orbe.

## Antes de trabalhar
1. Ler este ficheiro e README.md.
2. Identificar requisitos relevantes nos documentos funcionais.
3. Consultar docs/06-pendencias-e-plano.md para confirmar o estado das decisões.
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


## Arquitetura frontend web — obrigatório
Antes de criar ou alterar páginas em `web/`, consultar [docs/12-arquitetura-frontend-web.md](docs/12-arquitetura-frontend-web.md). A referência visual define aparência e comportamento aprovado, nunca autoriza copiar a organização monolítica de HTML/CSS/JS para React.

- Páginas devem compor componentes com responsabilidades delimitadas; não concentrar, sem justificação, estado de interação, transformação de dados, regras de negócio, formatação e toda a UI num único componente.
- Separar lógica derivada/testável em hooks de domínio da página e utilitários puros; componentes visuais recebem props e não duplicam cálculos.
- Reutilizar primeiro o design system Orbe/Tamagui, tokens e componentes existentes. Não introduzir padrões visuais ou estilos locais divergentes sem necessidade documentada.
- Manter tipos explícitos, estado local no menor componente responsável e efeitos apenas para sincronização externa.
- Não refatorar páginas adjacentes fora do escopo sem autorização; novas implementações devem seguir o padrão e páginas antigas serão corrigidas gradualmente.
- Na conclusão, executar build e lint da aplicação web quando o ambiente permitir; reportar separadamente o que foi executado e o que ficou por validar.
