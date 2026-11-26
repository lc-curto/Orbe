# Orbe — Gestão financeira pessoal

O Orbe é uma aplicação de gestão financeira pessoal, organizada num monorepo. Este repositório contém atualmente o backend Laravel, a aplicação web React e a documentação funcional e técnica. A aplicação mobile está prevista na arquitetura aprovada, mas ainda não faz parte do código disponível neste repositório.

## Estrutura

- `backend/` — API Laravel, domínio financeiro, persistência e testes ([guia backend](backend/README.md)).
- `web/` — aplicação React + TypeScript + Vite, com Tamagui ([guia web](web/README.md)).
- `docs/` — decisões de produto, regras financeiras, interface, arquitetura, estado e contratos API.
- `AGENTS.md` — regras de trabalho e desenvolvimento do projeto.

## Estado funcional

- Backend: autenticação Sanctum, contas e categorias, operações comuns pendentes/realizadas, transferências, cartões/faturas, pagamentos/reversões e recorrências nos contratos implementados.
- Web: Dashboard, Movimentos/Programações, Contas, Cartões/faturas e interface da Rota Financeira. A leitura está implementada para os fluxos suportados; os formulários e ações de escrita ainda não estão todos integrados.
- Criação de operações: FAB global com **Novo gasto**, **Novo rendimento** e **Nova transferência** nas páginas aprovadas.
- Dívidas/obrigações: permanecem no modelo financeiro, mas não existe página principal autónoma de Dívidas. Obrigações são relacionadas com os movimentos/faturas que lhes dão origem.
- Mobile: stack aprovada (React Native + Expo), implementação ainda não presente.

A interface não deve criar dados fictícios nem apresentar projeções como saldos realizados. Consultar [docs/05 — Estado e plano](docs/05-estado-e-plano.md) para o estado detalhado e as pendências.

## Requisitos de desenvolvimento

- PHP `^8.3` e Composer.
- Node.js e npm compatíveis com as dependências Vite/TypeScript do projeto.
- Base de dados suportada pela configuração Laravel. O `.env.example` do backend usa SQLite por omissão; também é possível configurar MySQL.

## Executar localmente

### 1. Backend

No PowerShell, a partir da raiz do repositório:

```powershell
cd backend
composer install

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

if (-not (Select-String -Path .env -Pattern '^APP_KEY=base64:.+' -Quiet)) {
    php artisan key:generate
}
```

Confirma a configuração de base de dados em `backend/.env`. Com a configuração SQLite por omissão, cria o ficheiro se ainda não existir (a partir de `backend/`):

```powershell
if (-not (Test-Path database/database.sqlite)) {
    New-Item -ItemType File database/database.sqlite | Out-Null
}
```

Se usares MySQL, define `DB_CONNECTION=mysql`, host, porta, nome da base de dados, utilizador e palavra-passe.

Executa as migrations e inicia a API:

```powershell
php artisan migrate
php artisan serve
```

A API fica normalmente disponível em `http://127.0.0.1:8000/api`.

### 2. Aplicação web

Abre outro terminal na raiz do repositório:

```powershell
cd web

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

npm install
npm run dev
```

O `web/.env.example` define `VITE_API_BASE_URL=http://127.0.0.1:8000/api`. Ajusta-o se a API estiver noutro endereço. A aplicação Vite fica normalmente em `http://localhost:5173`.

## Testes e validação

Backend, a partir de `backend/`:

```powershell
php artisan test
./vendor/bin/pint --test
```

Web, a partir de `web/`:

```powershell
npm run lint
npm run build
```

O Pint global pode identificar problemas de estilo preexistentes fora dos ficheiros de uma alteração. Para validar um conjunto de alterações sem formatar código não relacionado, executa `pint --test` apenas nos ficheiros modificados.

## Documentação

Ler [AGENTS.md](AGENTS.md) antes de trabalhar no projeto e consultar os documentos por domínio:

| Documento | Conteúdo |
|---|---|
| [01 — Produto e funcionalidades](docs/01-produto-e-funcionalidades.md) | Âmbito, requisitos, operações e critérios de aceitação |
| [02 — Regras financeiras](docs/02-regras-financeiras.md) | Invariantes, cálculos, estados financeiros e projeções |
| [03 — Interface e formulários](docs/03-interface-e-formularios.md) | Navegação, páginas, padrões visuais e comportamento dos formulários |
| [04 — Arquitetura, modelo e auditoria](docs/04-arquitetura-modelo-e-auditoria.md) | Stack, arquitetura, UML, ER, integridade e auditoria técnica |
| [05 — Estado e plano](docs/05-estado-e-plano.md) | Implementação, pendências, decisões abertas, validações e sequência de trabalho |
| [06 — Contratos da API](docs/06-contratos-api.md) | Contratos de operações, transferências e recorrências |

A documentação é a referência para produto, design, desenvolvimento e validação. Atualizar o documento de origem e as referências afetadas quando uma decisão ou implementação mudar; não criar documentos paralelos para cada página, contrato ou etapa.
