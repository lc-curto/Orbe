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

## 4. Decisão pendente: destino do lançamento
Comparar antes de aprovar:
- **A:** referência específica a conta, fatura ou dívida.
- **B:** destino financeiro genérico.
- **C:** comparação formal das alternativas em UML, avaliando integridade referencial, consultas, extensibilidade e complexidade.

A recomendação preliminar anterior foi A, mas não foi aprovada. Não fixar o modelo físico antes da decisão.

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