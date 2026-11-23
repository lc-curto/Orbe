# 05 — Arquitetura e UML

**Estado: em análise.** Distinguir decisões confirmadas de propostas técnicas. Uma proposta não autoriza implementação.

## Decisões tomadas
- Laravel 13 e MySQL obrigatórios.
- API Laravel comum para Web, Android e iOS.
- Preferência por monólito modular.
- Motor financeiro único.
- Separação conceptual entre operação (evento de negócio) e lançamentos (efeitos), relação 1:N.
- Estados e transições controlados pelas regras de domínio.
- Integridade e rastreabilidade financeira obrigatórias.

## Modelo conceptual inicial
Conceitos identificados: Utilizador, Conta financeira, Operação, Lançamento financeiro, Transferência, Cartão, Fatura, Dívida/obrigação, Prestação/agenda, Pagamento, Programação recorrente, Ocorrência recorrente, Histórico/auditoria e Conferência de saldo.

Isto não é ainda esquema físico. Atributos, cardinalidades, chaves, constraints e fronteiras de agregados precisam de UML.

## Decisão pendente: destino do lançamento
Comparar antes de aprovar:
- **A:** referência específica a conta, fatura ou dívida.
- **B:** destino financeiro genérico.
- **C:** comparação formal das alternativas em UML, avaliando integridade referencial, consultas, extensibilidade e complexidade.

A recomendação preliminar foi A, mas não foi aprovada. Não fixar o modelo físico antes da decisão.

## Arquitetura lógica proposta
- **Interface:** clientes Web, Android e iOS.
- **Aplicação:** API, autenticação, validação, autorização e casos de uso.
- **Domínio:** operações, lançamentos, contas, cartões, faturas, obrigações, recorrências e regras financeiras.
- **Infraestrutura:** MySQL, transações, bloqueios, scheduler, filas e consultas.

O domínio não deve depender da interface. Regras financeiras não devem ser reimplementadas separadamente nos clientes.

## Consistência e concorrência — proposta a validar
Transações de base de dados; constraints de integridade/unicidade; bloqueios quando necessários; ocorrências recorrentes idempotentes; tratamento de deadlocks; confirmação financeira consistente; tarefas assíncronas apenas quando não comprometem consistência imediata.

## Persistência e desempenho — proposta a validar
MySQL/InnoDB; índices baseados em consultas reais; análise de planos de execução; evitar N+1; paginação adequada; cache apenas de dados derivados e reconstruíveis. Não introduzir Redis, Elasticsearch ou microserviços sem necessidade demonstrada.

## Precisão monetária
Aritmética exata. Definir escala, arredondamento e representação persistida antes dos cálculos. Nunca usar float/double para valores monetários.

## UML a produzir e aprovar
1. ER: entidades, atributos essenciais, cardinalidades, chaves e constraints.
2. Domínio/classes: responsabilidades e relações financeiras.
3. Sequência: despesa, compra/pagamento de cartão, pagamento parcial de dívida, transferência, reversão e recorrência.
4. Estados: transições de operações e entidades relevantes.
5. Modelo físico: tabelas, índices e integridade referencial, após aprovação conceptual.

## Testes de arquitetura
Testar domínio sem interface, persistência/constraints, transações/concorrência, idempotência, fluxos financeiros completos e consistência entre consultas e saldos.