# Orbe — Backend

API do Orbe construída com Laravel 13, PHP e Sanctum. O backend centraliza autenticação, autorização, regras financeiras, persistência e efeitos de operações.

## Stack e requisitos

- PHP `^8.3`
- Laravel `^13.17`
- Composer
- SQLite para configuração local por omissão ou MySQL 8.4 conforme o ambiente

## Configuração local (PowerShell)

Executa na raiz do repositório:

```powershell
cd backend
composer install

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

php artisan key:generate

if (-not (Test-Path database/database.sqlite)) {
    New-Item -ItemType File database/database.sqlite | Out-Null
}

php artisan migrate
php artisan serve
```

A API fica normalmente disponível em `http://127.0.0.1:8000/api`.

O `.env.example` usa SQLite. Para MySQL, configura em `.env` `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` e `DB_PASSWORD` antes de executar as migrations. Gera a chave da aplicação apenas na configuração inicial ou quando `APP_KEY` estiver vazio.

## Testes e estilo

```powershell
php artisan test
./vendor/bin/pint --test
```

Para evitar alterações de estilo fora do escopo, o Pint pode ser limitado aos ficheiros PHP modificados:

```powershell
./vendor/bin/pint --test app/Services/BasicOperationService.php
```

## Limites atuais

O backend tem contratos implementados para autenticação, leitura financeira, operações comuns, transferências e recorrências, além dos fluxos financeiros de cartões/faturas cobertos pela API. A implementação de formulários frontend e alguns contratos de gestão contextual continuam pendentes. Não assumir que uma entidade do modelo já dispõe de todos os endpoints de gestão.

## Documentação

- [README principal](../README.md) — visão geral e execução do monorepo.
- [AGENTS.md](../AGENTS.md) — regras de trabalho do projeto.
- [Contratos da API](../docs/06-contratos-api.md)
- [Regras financeiras](../docs/02-regras-financeiras.md)
- [Estado e plano](../docs/05-estado-e-plano.md)
