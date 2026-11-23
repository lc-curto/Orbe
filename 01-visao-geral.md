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

## Plataformas e tecnologia
**Obrigatório:** Laravel 13, MySQL, Android, iOS e Web complementar. Uma API Laravel comum serve os clientes mobile e Web.

**Por decidir:** Flutter ou React Native; alojamento, distribuição, autenticação e infraestrutura.

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