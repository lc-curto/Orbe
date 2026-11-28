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

if (-not (Select-String -Path .env -Pattern '^APP_KEY=base64:.+' -Quiet)) {
    php artisan key:generate
}

if (-not (Test-Path database/database.sqlite)) {
    New-Item -ItemType File database/database.sqlite | Out-Null
}

php artisan migrate
php artisan serve
```

A API fica normalmente disponível em `http://127.0.0.1:8000/api`.

O `.env.example` usa SQLite. Para MySQL, configura em `.env` `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` e `DB_PASSWORD` antes de executar as migrations. Gera a chave da aplicação apenas na configuração inicial ou quando `APP_KEY` estiver vazio.

## Dados de QA para Movimentos

Para testar os formulários de Movimentos antes da implementação dos formulários de gestão de Contas/Categorias, prepara dados locais com o seeder:

```powershell
php artisan db:seed --class=QaFinancialDataSeeder
```

O seeder é idempotente e cria/atualiza dados associados ao utilizador local `test@example.com` (utilizador de desenvolvimento criado por `DatabaseSeeder`; palavra-passe local padrão `password`):
- 2 contas ativas (BANK e CASH) e 1 conta encerrada;
- 4 categorias ativas de despesa e 3 de receita;
- 1 categoria de despesa arquivada, para validar filtros de categorias ativas;
- saldo inicial e lançamentos realizados de exemplo;
- uma despesa pendente vencida de 100 € (`Supermercado`), uma despesa futura e um rendimento futuro;
- nove movimentos pendentes distribuídos por janeiro, fevereiro e março de 2027, para validar a visão de 3 meses e os cabeçalhos mensais.

O `DatabaseSeeder` também chama este seeder, por isso `php artisan db:seed` prepara o conjunto QA completo. Os registos têm prefixo `QA —`, exceto o movimento `Supermercado`, que reproduz o exemplo visível na interface.

O seeder usa chaves de idempotência e atualiza os registos QA existentes; pode ser executado repetidamente sem duplicar os exemplos. Usa apenas em base de dados local/de desenvolvimento.

## Refatoração e boas práticas — obrigatórias

Aplicar os Gates A/B/C de [AGENTS.md](../AGENTS.md) em toda alteração backend. Antes de editar, inspecionar o padrão do módulo e os contratos existentes; durante a implementação, corrigir problemas locais seguros em vez de perpetuá-los; antes de concluir, rever diff, testes e findings adiados.

Padrões Laravel/PHP:
- Usar Form Requests ou validação apropriada para entrada; Policies/Gates para autorização.
- Controllers coordenam HTTP; regras de domínio e efeitos financeiros ficam nos serviços/camadas de domínio existentes, sem duplicação.
- Respeitar transações, idempotência, FKs, constraints e invariantes financeiras aprovadas.
- Usar Eloquent evitando N+1; consultas e índices devem responder a necessidades reais.
- Tipos/retornos claros, convenções Laravel 13 e APIs da versão instalada; não introduzir dependências ou abstrações genéricas sem justificação.
- Refatoração local segura é obrigatória; mudanças de comportamento, contratos ou arquitetura exigem plano/decisão próprios.

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
