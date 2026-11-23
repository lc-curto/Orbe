# 05 — Arquitetura e UML

**Estado: em análise.** A stack principal e a organização em monorepo estão aprovadas. O desenho detalhado da arquitetura, modelo de dados e infraestrutura ainda precisa de validação. Uma proposta não autoriza implementação.

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

## 3. Modelo conceptual inicial
Conceitos identificados: Utilizador, Conta financeira, Operação, Lançamento financeiro, Transferência, Cartão, Fatura, Dívida/obrigação, Prestação/agenda, Pagamento, Programação recorrente, Ocorrência recorrente, Histórico/auditoria e Conferência de saldo.

Isto não é ainda esquema físico. Atributos, cardinalidades, chaves, constraints e fronteiras de agregados precisam de UML.

## 4. ARC-001 — Destino dos lançamentos financeiros

**Estado: recomendação técnica apresentada; aprovação pendente.**

### 4.1 Premissa do domínio
A Operação representa o evento de negócio. Os Lançamentos representam os efeitos financeiros desse evento. Cada lançamento deve identificar inequivocamente o destino financeiro do efeito. Uma operação pode gerar vários lançamentos associados; não se deve obrigar todos os efeitos a partilhar o mesmo destino.

### 4.2 Alternativa A — referências específicas
O lançamento contém referências próprias para os destinos suportados, por exemplo:
- `account_id`
- `invoice_id`
- `debt_id`

Cada referência é uma chave estrangeira para a respetiva tabela. Uma constraint deve garantir que exatamente uma das referências está preenchida. MySQL 8.4 suporta `CHECK` constraints aplicadas a inserções e atualizações.

**Vantagens**
- Integridade referencial nativa para cada destino.
- Modelo explícito e fácil de inspecionar no SQL.
- Consultas e joins previsíveis.
- Sem tabela técnica adicional.
- As entidades mantêm a sua identidade e semântica próprias.

**Desvantagens**
- Novos tipos de destino exigem alteração do esquema.
- A tabela de lançamentos acumula colunas específicas.
- A regra “exatamente um destino” precisa de constraint e testes.
- Consultas comuns a todos os destinos podem exigir normalização na camada de aplicação.

### 4.3 Alternativa B1 — associação polimórfica
O lançamento guarda `destination_type` e `destination_id`; o tipo determina a tabela onde o ID deve existir.

**Vantagens**
- Estrutura compacta.
- Adicionar tipos é relativamente simples na aplicação.
- Laravel Eloquent suporta relações polimórficas.

**Desvantagens**
- Uma chave estrangeira SQL normal não consegue apontar dinamicamente para várias tabelas.
- A base de dados não consegue garantir, apenas com essa associação, que o registo de destino existe.
- A aplicação passa a assumir mais responsabilidade pela integridade, eliminação e consistência dos tipos.
- Consultas e joins exigem tratamento por tipo.

**Conclusão parcial:** rejeitar esta variante para referências centrais do motor financeiro. A conveniência do ORM não compensa enfraquecer a integridade referencial de dados financeiros.

### 4.4 Alternativa B2 — entidade genérica real
Criar uma tabela `financial_destinations` como identidade comum. Contas, faturas e dívidas teriam relações especializadas com essa entidade; o lançamento apontaria para `financial_destinations.id`.

**Vantagens**
- O lançamento tem uma única FK.
- A identidade comum pode facilitar consultas e relações transversais.
- A FK do lançamento pode ser validada pelo MySQL.

**Desvantagens**
- Introduz uma entidade técnica que não corresponde necessariamente a um conceito de negócio autónomo.
- Exige sincronizar a criação e o ciclo de vida da entidade genérica com a entidade especializada.
- A FK garante a existência do registo genérico, mas não garante por si só que exista exatamente uma especialização válida (conta, fatura ou dívida).
- Aumenta joins, migrations, regras de domínio e pontos de falha.
- Não elimina a necessidade de regras específicas por tipo.

### 4.5 Comparação técnica

| Critério | A — Específicas | B1 — Polimórfica | B2 — Superentidade |
|---|---|---|---|
| FK nativa para destino | Sim | Não, não diretamente | Sim, para a superentidade |
| Existência do destino garantida pela BD | Sim | Não | Parcial: garante o registo genérico |
| Complexidade do esquema | Baixa/média | Baixa | Média/alta |
| Consultas por tipo | Diretas | Condicionadas pelo tipo | Exigem joins |
| Adicionar novo tipo | Alterar esquema | Mais simples | Criar especialização e regras |
| Responsabilidade da aplicação | Moderada | Elevada | Moderada/elevada |
| Adequação a dados financeiros críticos | Alta | Baixa | Boa, se a abstração tiver valor real |

### 4.6 Conclusão técnica e recomendação

**Recomendação: Alternativa A — referências específicas, com uma única referência válida por lançamento.**

Razões:
1. O conjunto atual de destinos é conhecido e limitado: conta, fatura e dívida/obrigação.
2. A integridade referencial nativa é prioritária num motor financeiro.
3. A entidade genérica B2 acrescenta abstração e obrigações de consistência sem benefício de domínio demonstrado.
4. B1 transfere para a aplicação uma garantia que deve permanecer na base de dados.
5. A evolução futura pode justificar rever o modelo, mas não justifica antecipar agora uma camada genérica.

A recomendação pressupõe que cada lançamento representa um único efeito e tem exatamente um destino. Quando uma operação afeta vários destinos, deve gerar vários lançamentos associados à mesma operação, em vez de vários destinos no mesmo lançamento.

A implementação de A deve avaliar:
- FKs individuais para cada destino;
- constraint `CHECK` para garantir exatamente um destino preenchido;
- índices necessários às FKs e consultas;
- proteção de propriedade/tenant para impedir referências cruzadas entre utilizadores, usando constraints compostas quando adequado ou validação transacional no domínio;
- política de eliminação restritiva e preservação do histórico financeiro.

**Esta recomendação não está aprovada ainda.** O modelo físico não deve ser implementado antes da confirmação.

### 4.7 Fontes técnicas consultadas
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

## 10. Testes de arquitetura
Testar domínio sem interface, persistência/constraints, transações/concorrência, idempotência, fluxos financeiros completos e consistência entre consultas e saldos.

## 11. Decisões técnicas ainda pendentes
Autenticação e sessões; alojamento e deploy; ferramentas de testes e CI/CD; backups e recuperação.