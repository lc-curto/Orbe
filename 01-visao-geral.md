# 01 — Visão geral do Orbe

## Objetivo
Aplicação de gestão financeira pessoal para compreender e gerir contas, movimentos, cartões de crédito, dívidas, recorrências, relatórios e projeções. O produto combina rigor financeiro com uma experiência simples; a interface não deve expor complexidade técnica desnecessária.

## Utilizador e âmbito
**Aprovado**
- Utilização individual; um utilizador pode gerir várias contas.
- Contas bancárias, dinheiro físico e carteiras digitais.
- Receitas e despesas realizadas ou pendentes.
- Transferências, cartões, faturas, dívidas, prestações, pagamentos parciais e recorrências.
- Relatórios de operações realizadas.
- Rota Financeira para projeções futuras.

**Fora do âmbito atual**
- Multiutilizador/família.
- Multi-moeda e conversão cambial.
- Orçamentos e metas de poupança.
- Projeções no Dashboard, Movimentos, Contas, Cartões e Relatórios.

## Moeda
O utilizador escolhe uma moeda principal. A aplicação opera apenas nessa moeda.

## Plataformas e stack aprovada
- **Backend:** Laravel 13 + PHP.
- **Base de dados:** MySQL 8.4 LTS.
- **Web:** React + TypeScript + Vite.
- **Mobile:** React Native + Expo + TypeScript, para Android e iOS.
- **Comunicação:** API REST com JSON, comum aos clientes Web e mobile.

Os clientes Web e mobile terão interfaces próprias, mas utilizarão o mesmo backend. Tipos, validações e módulos partilháveis podem ser reutilizados quando tecnicamente adequado; não se exige partilha de todos os componentes visuais.

## Outras decisões técnicas pendentes
- Autenticação e gestão de sessões.
- Alojamento, distribuição e infraestrutura.
- Estratégia de monorepo ou repositórios separados.
- Ferramentas finais de testes e CI/CD.

## Princípios
1. Motor financeiro único.
2. Não duplicar efeitos financeiros.
3. Preservar origem e histórico das correções.
4. Separar realizado de previsto.
5. Manter regras de domínio consistentes entre plataformas.
6. Não apresentar ações indisponíveis.
7. Preferir arquitetura simples e modular; complexidade adicional exige justificação.

## Critério de sucesso
Os saldos e resultados devem ser coerentes em todas as páginas e plataformas, sem duplicação de efeitos financeiros.