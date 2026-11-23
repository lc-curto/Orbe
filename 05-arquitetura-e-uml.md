# 05 — Arquitetura e UML

**Estado: em análise.** A stack principal, a organização em monorepo e a decisão ARC-001 estão aprovadas. O desenho detalhado do modelo de dados e da infraestrutura ainda precisa de validação. Uma proposta não autoriza implementação.

## 1. Stack tecnológica aprovada
- **Backend:** Laravel 13 + PHP.
- **Base de dados:** MySQL 8.4 LTS.
- **Web:** React + TypeScript + Vite.
- **Mobile:** React Native + Expo + TypeScript para Android e iOS.
- **Comunicação:** API REST com JSON, comum aos dois clientes.
- **Organização:** monorepo único.

Estrutura lógica de referência:
```text
Orbe/
├── backend/
├── web/
├── mobile/
├── docs/
├── AGENTS.md
└── README.md
```

Cada aplicação mantém as suas próprias dependências, configuração e processo de execução. Não adotar Nx, Turborepo ou outra ferramenta de orquestração nesta fase sem necessidade demonstrada.

Web e mobile terão interfaces próprias. Tipos, validações e módulos partilháveis podem ser reutilizados quando adequado; componentes visuais não precisam de ser os mesmos.

## 2. Decisões arquiteturais já tomadas
- API Laravel comum para Web, Android e iOS.
- Monorepo para Backend, Web, Mobile e documentação.
- Preferência por monólito modular.
- Motor financeiro único.
- Separação conceptual entre operação (evento de negócio) e lançamentos (efeitos), relação 1:N.
- Estados e transições controlados pelas regras de domínio.
- Integridade e rastreabilidade financeira obrigatórias.
- **ARC-001 aprovado:** cada lançamento referencia exatamente um destino através de referências específicas com FKs próprias.

## 3. Modelo conceptual e ER

O modelo ER conceptual e a sua fundamentação estão em [07 — Modelo ER](07-modelo-er.md).

O documento detalha:
- Operação como evento de negócio e lançamento como efeito financeiro.
- Destinos específicos aprovados em ARC-001.
- Cartões, faturas, dívidas, prestações, transferências, recorrências e conferências.
- A diferença entre os dados efetivos e os eventos usados em projeções.
- Como Dashboard, Movimentos, Rota Financeira e restantes páginas consultam o mesmo núcleo com objetivos e granularidades diferentes.

**Estado:** proposta conceptual elaborada; ARC-002 aguarda validação. O diagrama não é ainda esquema físico e não autoriza migrations.

## 4. ARC-001 — Destino dos lançamentos financeiros

**Estado: aprovado. Alternativa A — referências específicas.**

### 4.1 Regra aprovada
Cada lançamento financeiro identifica exatamente um destino. O destino é representado por uma referência específica à entidade correspondente, com chave estrangeira própria.

Destinos considerados no modelo atual:
- Conta financeira: `account_id`
- Fatura: `invoice_id`
- Dívida/obrigação: `debt_id`

A estrutura final das colunas e os nomes físicos serão confirmados no modelo ER e no esquema físico. A decisão aprova o padrão de referências específicas, não todos os detalhes de implementação.

### 4.2 Integridade obrigatória
- Cada referência deve ter FK para a respetiva tabela.
- Exatamente uma referência de destino deve estar preenchida por lançamento.
- Implementar a regra de destino único com `CHECK` constraint no MySQL 8.4, acompanhada de testes.
- Aplicar índices necessários às FKs e consultas.
- Impedir referências cruzadas entre utilizadores; avaliar FKs compostas ou validação transacional no domínio.
- Preservar histórico financeiro; evitar eliminação em cascata de destinos com lançamentos associados.

### 4.3 Consequências para o modelo
Uma operação pode originar vários lançamentos. Cada lançamento representa um efeito financeiro e tem o seu próprio destino. Não colocar vários destinos no mesmo lançamento.

A alternativa de associação polimórfica (`destination_type + destination_id`) não será usada para os destinos centrais do motor financeiro, pois não oferece FK SQL direta para as diferentes tabelas. A superentidade genérica também não será introduzida nesta fase, por acrescentar complexidade sem benefício de domínio demonstrado.

A decisão poderá ser revista se surgir um novo requisito que justifique uma abstração diferente, mas não deve ser alterada apenas por conveniência do ORM.

### 4.4 Fundamentação técnica registada
A comparação considerou integridade referencial, complexidade do esquema, consultas, evolução e responsabilidade da aplicação. A alternativa A foi escolhida por manter a integridade próxima dos dados, tornar as relações explícitas e evitar uma abstração genérica prematura.

Fontes técnicas:
- [MySQL 8.4 — Foreign Key Constraints](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html)
- [MySQL 8.4 — CHECK Constraints](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html)
- [Laravel 13 — Eloquent Polymorphic Relationships](https://laravel.com/docs/13.x/eloquent-relationships#polymorphic-relationships)

## 5. Arquitetura lógica proposta
- **Interface:** clientes Web (React) e mobile (React Native).
- **Aplicação:** API, autenticação, validação, autorização e casos de uso.
- **Domínio:** operações, lançamentos, contas, cartões, faturas, obrigações, recorrências e regras financeiras.
- **Infraestrutura:** MySQL, transações, bloqueios, scheduler, filas e consultas.

O domínio não deve depender da interface. Regras financeiras não devem ser reimplementadas separadamente nos clientes.

## 6. Consistência e concorrência — proposta a validar
Transações de base de dados; constraints de integridade/unicidade; bloqueios quando necessários; ocorrências recorrentes idempotentes; tratamento de deadlocks; confirmação financeira consistente; tarefas assíncronas apenas quando não comprometem consistência imediata.

## 7. Persistência e desempenho — proposta a validar
MySQL/InnoDB; índices baseados em consultas reais; análise de planos de execução; evitar N+1; paginação adequada; cache apenas de dados derivados e reconstruíveis. Não introduzir Redis, Elasticsearch ou microserviços sem necessidade demonstrada.

## 8. Precisão monetária
Aritmética exata. Definir escala, arredondamento e representação persistida antes dos cálculos. Nunca usar float/double para valores monetários.

## 9. UML a produzir e aprovar
1. ER: entidades, atributos essenciais, cardinalidades, chaves e constraints.
2. Domínio/classes: responsabilidades e relações financeiras.
3. Sequência: despesa, compra/pagamento de cartão, pagamento parcial de dívida, transferência, reversão e recorrência.
4. Estados: transições de operações e entidades relevantes.
5. Modelo físico: tabelas, índices e integridade referencial, após aprovação conceptual.

O ER conceptual está apresentado em [07 — Modelo ER](07-modelo-er.md). As restantes vistas UML e o modelo físico continuam por produzir/aprovar.

## 10. Testes de arquitetura
Testar domínio sem interface, persistência/constraints, transações/concorrência, idempotência, fluxos financeiros completos e consistência entre consultas e saldos.

## 11. Decisões técnicas ainda pendentes
Validação do modelo ER (ARC-002); modelo físico e cardinalidades; representação monetária, escala e arredondamento; autenticação e sessões; alojamento e deploy; ferramentas de testes e CI/CD; backups e recuperação.