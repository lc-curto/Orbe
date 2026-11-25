# 08 — Cronograma e estado de implementação

> Documento de controlo do projeto. Atualizado em 2026-11-24.
>
> Este documento regista o estado conhecido no repositório e orienta a sequência de trabalho. Um item marcado como concluído significa que existe implementação ou decisão versionada; não significa que todos os fluxos relacionados estejam completos ou que a auditoria final tenha sido concluída.

## Legenda

- `[x]` concluído ou implementado no estado atual.
- `[ ]` por fazer.
- `[!]` bloqueado ou condicionado por contrato, decisão ou validação ainda em falta.

## 1. Fundamentos e arquitetura

- [x] Fechar os fundamentos do produto e as regras financeiras principais.
- [x] Consolidar regras de cartões, faturas, pagamentos, reversões e saldo inicial.
- [x] Aprovar o modelo ER conceptual e a decisão ARC-001.
- [x] Produzir e aprovar UML complementar de domínio, sequências e máquinas de estado do núcleo financeiro.
- [x] Aprovar o modelo físico do núcleo financeiro, precisão monetária e arredondamento (`DECIMAL(19,4)`); extensões conceptuais ainda sem migrations permanecem delimitadas.
- [x] Organizar a documentação na pasta `docs/`.

## 2. Backend e núcleo financeiro

- [x] Criar a estrutura Laravel do backend.
- [x] Criar as migrations principais do núcleo financeiro.
- [x] Criar contas financeiras, cartões, dívidas e faturas.
- [x] Criar operações e lançamentos financeiros.
- [x] Criar alocações de compras.
- [x] Criar saldo inicial de cartão e distribuições.
- [x] Criar correções de saldo inicial.
- [x] Criar alocações de pagamentos.
- [x] Criar rastreabilidade de reversões de pagamentos.
- [x] Adicionar constraints e validações de integridade financeira.
- [x] Implementar serviços financeiros transacionais.
- [x] Implementar idempotência nos fluxos financeiros implementados.
- [x] Executar testes negativos de integridade.
- [x] Executar testes positivos de compras, pagamentos e reversões.
- [x] Completar a validação do modelo físico contra o núcleo financeiro implementado; cobertura e lacunas estão em [09 — Auditoria do backend e do núcleo](09-auditoria-backend-e-nucleo.md).
- [x] Definir e implementar o contrato mínimo de contas, categorias, despesas comuns e receitas — Fase 1.
- [x] Definir e implementar o contrato mínimo de transferências com duas pernas — Fase 2.
- [x] Implementar recorrências — Fase 3, conforme [12 — Contrato de recorrências](12-contrato-recorrencias.md).
- [!] Implementar gestão completa de dívidas: depende do contrato específico e das fases seguintes.

## 3. Autenticação e API

- [x] Implementar autenticação com Laravel Sanctum.
- [x] Implementar registo de utilizador e emissão de token.
- [x] Implementar login.
- [x] Implementar logout e revogação de token.
- [x] Implementar consulta do utilizador autenticado.
- [x] Implementar pedido de recuperação e redefinição de palavra-passe.
- [x] Implementar autorização e isolamento por utilizador nos endpoints existentes.
- [x] Implementar leitura de cartões.
- [x] Implementar leitura de detalhe de cartão.
- [x] Implementar leitura de faturas.
- [x] Implementar leitura de operações.
- [x] Implementar endpoint de saldo inicial de cartão.
- [x] Implementar endpoint de compras parceladas.
- [x] Implementar endpoint de alocação de pagamentos.
- [x] Implementar endpoint de reversão de pagamentos.
- [x] Implementar endpoints mínimos de contas.
- [x] Implementar endpoints mínimos de categorias.
- [x] Implementar endpoints mínimos de despesas comuns.
- [x] Implementar endpoints mínimos de receitas.
- [x] Implementar endpoint mínimo de transferências com confirmação de pernas pendentes.
- [x] Implementar endpoints de recorrências, geração idempotente, materialização e alterações de ocorrências.
- [ ] Implementar endpoints de transferências.
- [ ] Implementar endpoints de edição, cancelamento, eliminação e reversão contextual.
- [ ] Integrar o frontend com a API e a autenticação.

## 4. Dashboard e Design System

- [x] Escolher React + TypeScript + Vite.
- [x] Escolher desenvolvimento local puro.
- [x] Implementar o Dashboard aprovado.
- [x] Implementar as variantes desktop e mobile do Dashboard.
- [x] Implementar sidebar recolhível no desktop.
- [x] Implementar navegação inferior no mobile.
- [x] Implementar seletor mensal.
- [x] Implementar saldo, receitas, despesas e resultado.
- [x] Implementar ações rápidas.
- [x] Implementar despesas por categoria em desktop e mobile.
- [x] Preservar o Dashboard durante a implementação dos formulários.
- [x] Criar tokens e componentes base reutilizáveis do Design System.
- [ ] Auditar completamente a substituição de estilos hardcoded e regressões entre breakpoints.

## 5. Especificação dos formulários

- [x] Definir e aprovar a especificação visual e de interação dos formulários.
- [x] Aprovar modal centralizado para desktop/tablet.
- [x] Aprovar bottom sheet para mobile.
- [x] Aprovar full screen para formulários extensos.
- [x] Aprovar campos, valor monetário, listas, datas, confirmação e rodapé fixo.
- [x] Aprovar proteção contra alterações não guardadas.
- [x] Aprovar loading, erros, estados vazios e navegação multi-step.
- [x] Confrontar a especificação visual com as regras funcionais.
- [x] Identificar campos e fluxos que não podem ser inventados.

## 6. Infraestrutura visual dos formulários — Fase A

- [x] Criar `FormModal`, `FormSheet` e `ResponsiveFormContainer`.
- [x] Criar `FullScreenForm` e infraestrutura multi-step.
- [x] Criar campos reutilizáveis, incluindo `MoneyInput` e `DateInput`.
- [x] Criar listas reutilizáveis para categorias, contas e cartões.
- [x] Criar estados de loading, erro e vazio.
- [x] Criar confirmação adaptativa e proteção contra alterações não guardadas.
- [x] Bloquear o scroll do `body` durante modais e diálogos.
- [x] Corrigir a duplicação de modal no desktop.
- [x] Garantir um único formulário e um único overlay.
- [x] Adicionar safe areas mobile e identificador visual do bottom sheet.
- [x] Adicionar atalhos de data e diferenciação visual da transferência.
- [x] Remover categorias e contas fictícias.
- [x] Usar estados vazios quando não existem dados funcionais.
- [x] Validar com `npm run lint`, `npm run build` e `git diff --check`.
- [x] Publicar a Fase A na `origin/main` no commit `b2cf768`.

## 7. Cliente API e autenticação do frontend — Fase 4

- [x] Criar cliente HTTP centralizado.
- [x] Criar tipos TypeScript para respostas e erros da API.
- [x] Implementar login, logout e consulta `/auth/me` no frontend.
- [x] Implementar interfaces de entrada, criação de conta, recuperação e redefinição de palavra-passe.
- [x] Apresentar logout funcional no Dashboard desktop e mobile.
- [x] Armazenar e enviar o token Sanctum segundo a arquitetura aprovada.
- [x] Tratar respostas `401`, `422` e erros gerais.
- [x] Criar provider comum de loading e erro de sessão.
- [ ] Testar expiração e revogação de sessão no frontend com interação real.

## 8. Leitura de dados reais

- [x] Ligar o frontend às listagens de cartões, faturas e operações.
- [x] Disponibilizar leitura tipada do detalhe de cartão.
- [x] Remover dados estáticos de fatura e últimos movimentos onde existe fonte API disponível.
- [x] Mostrar loading, erro e vazio baseados nos dados do utilizador.
- [x] Implementar a leitura frontend das páginas Movimentos e Programações, incluindo KPIs mensais de operações realizadas, filtros de estado e consulta de ocorrências.
- [ ] Validar o isolamento entre utilizadores no consumo da API com interação real.

## 9. Formulários concretos suportados pelos contratos atuais

Estes são os únicos fluxos de escrita que têm contratos backend confirmados neste momento.

- [ ] Formulário de saldo inicial de cartão.
- [ ] Distribuição integral do saldo inicial por faturas.
- [ ] Validação da soma das distribuições.
- [ ] Formulário de compra parcelada.
- [ ] Distribuição da compra pelos ciclos.
- [ ] Resumo e confirmação da compra.
- [ ] Idempotência e tratamento de erros do envio da compra.
- [ ] Formulário de alocação de pagamento.
- [ ] Seleção de obrigações da mesma fatura.
- [ ] Validação de pagamento parcial.
- [ ] Formulário de reversão parcial ou total.
- [ ] Apresentação da operação original antes da reversão.
- [ ] Mapeamento de erros financeiros para mensagens contextuais.
- [ ] Garantia de que nenhum efeito financeiro é criado antes da confirmação.

## 10. Contratos ainda necessários

- [ ] Definir campos e endpoints de contas.
- [ ] Definir campos e endpoints de categorias.
- [ ] Definir campos e endpoints de despesas.
- [ ] Definir campos e endpoints de receitas.
- [ ] Definir campos e endpoints de transferências.
- [ ] Definir permissões e ações por estado.
- [ ] Definir edição, cancelamento, eliminação e reversão contextual.
- [ ] Definir pagamento completo de faturas.
- [ ] Fechar políticas de faturas vencidas, ciclos anteriores e crédito negativo.
- [ ] Fechar precisão monetária e arredondamento.

Enquanto estes contratos não existirem, o frontend não deve criar categorias, contas, endpoints, payloads ou fluxos fictícios.

## 11. Formulários comuns após os contratos

- [ ] Implementar despesa.
- [ ] Implementar receita.
- [ ] Implementar transferência.
- [ ] Implementar criação e edição de conta.
- [ ] Implementar criação e edição de cartão.
- [ ] Integrar o saldo inicial à criação do cartão.
- [ ] Implementar pagamento de fatura.
- [ ] Implementar edição, cancelamento, eliminação e reversão conforme o estado.
- [ ] Implementar menus contextuais adaptativos.

## Decisão de execução — 2026-11-25

Antes de implementar os formulários concretos, o produto deve completar as subpáginas principais em modo de leitura. Esta ordem reduz retrabalho, permite validar a navegação e o `AppShell` em todos os tamanhos de ecrã e garante que cada página é ligada apenas aos dados e contratos já existentes.

A sequência de subpáginas é: Movimentos/Programações, Contas, Cartões e faturas, Rota Financeira, Dívidas, Relatórios e Configurações. Os formulários de escrita avançam depois desta ronda, respeitando os contratos backend confirmados.

A Rota Financeira está especificada visualmente, mas não pode ser implementada com projeções fictícias nesta etapa. A API atual não expõe ainda um read model diário de projeção e faltam no frontend os dados de classificação fixa/variável/excluída e as regras completas de obrigações futuras. A sua implementação fica condicionada ao fecho desse contrato de leitura e projeção.

## 12. Subpáginas

- [x] Implementar Movimentos e a aba Programações em modo de leitura.
- [!] Implementar Rota Financeira — aguarda contrato/read model de projeção diária.
- [ ] Implementar Contas.
- [ ] Implementar Cartões e detalhe de faturas.
- [ ] Implementar Dívidas e detalhe de pagamentos.
- [ ] Implementar Relatórios.
- [ ] Implementar Configurações conforme a navegação aprovada.
- [ ] Garantir que operações com vários lançamentos aparecem uma única vez.

## 13. Testes e auditoria final

- [x] Testar invariantes financeiras básicas.
- [x] Testar compras parceladas sem duplicar despesas.
- [x] Testar pagamentos parciais.
- [x] Testar reversões parciais.
- [x] Testar autenticação e revogação de tokens no backend.
- [x] Testar isolamento de dados no backend.
- [ ] Testar o cliente API e os formulários no frontend.
- [ ] Testar desktop, tablet e mobile.
- [ ] Testar teclado, safe areas e rodapé fixo.
- [ ] Testar loading, erro, vazio e alterações não guardadas.
- [ ] Testar ações permitidas por estado.
- [ ] Testar fluxos completos de pagamentos e reversões pela UI.
- [ ] Auditar que nenhuma regra financeira foi duplicada no frontend.
- [ ] Auditar que o Dashboard não foi alterado.
- [ ] Auditar consistência entre documentação, API, frontend e modelo ER.
- [ ] Fazer commit final e publicar a versão aprovada.

## Próxima sequência de execução

1. Completar as subpáginas em modo de leitura: Contas, Cartões/faturas, Rota Financeira, Dívidas, Relatórios e Configurações.
2. Fechar os contratos de leitura e projeção necessários para a Rota Financeira, sem criar dados ou regras fictícias.
3. Validar a navegação e o `AppShell` em desktop, tablet e mobile.
4. Implementar os formulários suportados pelos contratos atuais.
5. Validar os fluxos completos no frontend.
6. Implementar os formulários comuns após o fecho dos contratos pendentes.
7. Executar a auditoria final e publicar apenas após autorização explícita.

## Regra de controlo

Este documento é um mapa de execução, não substitui as especificações funcionais, financeiras ou de arquitetura. Quando houver conflito, prevalecem `AGENTS.md`, as regras financeiras, a especificação funcional e as decisões aprovadas nos documentos de origem. Cada alteração relevante deve atualizar este estado no mesmo conjunto de alterações, sem marcar como concluído algo que apenas foi proposto.
