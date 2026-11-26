# Orbe — Web

Aplicação web do Orbe em React + TypeScript + Vite, com Tamagui e `react-native-web` para a camada de compatibilidade de componentes.

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

## Estado funcional

A aplicação inclui Dashboard, Movimentos/Programações, Contas, Cartões/faturas e interface da Rota Financeira. A leitura está implementada para os fluxos suportados; os formulários e ações de escrita ainda não estão todos integrados. O FAB global nas páginas aprovadas apresenta **Novo gasto**, **Novo rendimento** e **Nova transferência**.

Não criar dados fictícios nem apresentar projeções como valores realizados. A página principal autónoma de Dívidas foi descontinuada; obrigações permanecem ligadas aos movimentos/faturas associados.

## Documentação

- [README principal](../README.md)
- [Interface e formulários](../docs/03-interface-e-formularios.md)
- [Estado e plano](../docs/05-estado-e-plano.md)
- [Arquitetura frontend](../docs/04-arquitetura-modelo-e-auditoria.md)
