# Orbe — Web

Aplicação web do Orbe em React + TypeScript + Vite. A camada visual usa primitives nativas React/HTML e CSS, centralizadas em `src/design-system/`; não depende de Tamagui nem de `react-native-web`.

## Requisitos

- Node.js e npm compatíveis com as dependências declaradas em `package.json`.

## Configuração local (PowerShell)

A partir da raiz do repositório:

```powershell
cd web

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

npm install
npm run dev
```

A aplicação Vite fica normalmente em `http://localhost:5173`.

O `.env.example` define `VITE_API_BASE_URL=http://127.0.0.1:8000/api`. Ajusta o valor se o backend estiver noutro endereço. Inicia o backend em paralelo; o proxy de desenvolvimento Vite encaminha pedidos `/api` para `http://127.0.0.1:8000`.

## Comandos

```powershell
npm run lint
npm run build
npm run preview
```

- `dev`: servidor Vite com hot reload.
- `lint`: ESLint.
- `build`: verificação TypeScript e build de produção.
- `preview`: serve localmente o build produzido.

## Organização do código

`src/app/` contém a composição da aplicação e o shell. As páginas e componentes de domínio ficam em `src/features/<domínio>/`, organizados em `pages/`, `components/`, `hooks/`, `utils/` e `styles/` conforme necessário. Componentes reutilizáveis sem dono de domínio ficam em `src/shared/components/`; tokens e primitives ficam em `src/design-system/`; contratos e acesso à API ficam em `src/api/`.

O entrypoint é `src/main.tsx`. `src/index.css` agrega os estilos transversais e por feature, preservando a ordem de importação. Evitar páginas na raiz de `src`, imports de componentes de uma página para outra e folhas CSS globais monolíticas. Novos estilos devem ser colocados junto da feature e usar nomes de classe específicos.

## Regra de refatoração e boas práticas (obrigatória)

Toda alteração deve cumprir os Gates A/B/C definidos em [AGENTS.md](../AGENTS.md): inspeção antes de editar, correção de problemas locais seguros durante a implementação e checklist de revisão antes de concluir/abrir PR. Refatoração oportunista não é opcional: não perpetuar duplicação, estado derivável, lógica React inadequada, estilos/tokens contraditórios ou componentes mal acoplados só porque não foram pedidos diretamente.

Padrões Web obrigatórios:
- React: render puro, Rules of Hooks, estado mínimo, dados derivados em funções/hooks; evitar efeitos para derivação.
- TypeScript: contratos tipados; evitar `any`, casts e supressões sem justificação.
- UI: reutilizar primitives e tokens de `src/design-system/`; seguir container, gutters e escala de spacing partilhados; não criar escalas por página. `!important` é proibido como solução estrutural e só pode ser último recurso, com justificação explícita conforme `AGENTS.md`.
- CSS: estilos junto da feature, classes específicas, sem duplicar overrides globais; exceções responsivas devem ser justificadas.
- Não adicionar biblioteca, abstração genérica ou arquitetura nova sem necessidade demonstrada e aprovação quando alterar a stack/decisão.

Antes de concluir, reportar refatorações feitas, findings adiados (com motivo e item de trabalho), lint, build, testes e QA visual executados/não executados. Uma tarefa não pode ser declarada concluída com gates ignorados ou findings relevantes não registados.

## Validação contínua

A workflow `Web CI` executa `npm ci`, ESLint e `npm run build` (TypeScript + Vite) em pushes e pull requests que alterem `web/**`. Pode também ser executada manualmente no GitHub Actions.

## Estado funcional

A aplicação inclui Dashboard, Movimentos/Programações, Contas, Cartões/faturas, Rota Financeira, Relatórios e Configurações. CI de lint, TypeScript e build TypeScript/Vite passou na branch de estabilização no commit `4ab231e5c1feb18f9ced8379fa59b49824ffabaa`; lint/build local e QA visual responsivo desktop/mobile permanecem pendentes. A leitura está implementada para os fluxos suportados; os formulários e ações de escrita ainda não estão todos integrados. O FAB global nas páginas aprovadas apresenta **Novo gasto**, **Novo rendimento** e **Nova transferência**.

Não criar dados fictícios nem apresentar projeções como valores realizados. A página principal autónoma de Dívidas foi descontinuada; obrigações permanecem ligadas aos movimentos/faturas associados.

## Documentação

- [README principal](../README.md)
- [Interface e formulários](../docs/03-interface-e-formularios.md)
- [Estado e plano](../docs/05-estado-e-plano.md)
- [Arquitetura frontend](../docs/04-arquitetura-modelo-e-auditoria.md)
