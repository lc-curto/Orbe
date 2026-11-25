## 12 — Arquitetura Frontend Web

Este documento estabelece o padrão obrigatório para novas páginas e refatorações em `web/` (React + TypeScript + Vite + Tamagui). A documentação funcional e os protótipos definem o que a interface deve fazer e como deve parecer; não definem a arquitetura do código.

## Princípios

1. **Composição, não monólito:** uma página coordena componentes e estado de página. Não deve implementar, num único ficheiro, toda a UI detalhada, transformação de dados, formatação, filtros e comportamento de modais.
2. **Uma responsabilidade por módulo:** separar por responsabilidade real, não por quantidade arbitrária de linhas. Evitar componentes minúsculos sem lógica ou reutilização significativa.
3. **Dados e apresentação separados:** carregamento/acesso à API pertence à camada de dados existente; transformação/derivação da página fica num hook ou função pura; componentes de apresentação recebem dados e callbacks por props.
4. **Estado no menor âmbito adequado:** estado de interação fica no componente que o controla ou no nível comum mais próximo. Não duplicar estado derivável; usar `useMemo` apenas quando necessário, não como substituto de arquitetura.
5. **Regras de domínio centralizadas:** não duplicar regras financeiras na UI. A página apresenta contratos/read models existentes e não inventa saldos, classificações ou projeções.
6. **Design system primeiro:** reutilizar componentes, tokens, ícones e padrões Tamagui/Orbe existentes. CSS específico é permitido para layout/estados particulares, mas não deve recriar componentes globais ou valores de design já tokenizados.
7. **Tipos explícitos:** tipos da feature ficam num módulo próprio quando partilhados; evitar tipos duplicados ou inferências frágeis entre componentes.
8. **Acessibilidade e responsividade:** manter semântica, labels, estados de foco/disabled, navegação por teclado e comportamento mobile-first.
9. **Sem refatoração oportunista:** não expandir uma tarefa para reescrever páginas antigas ou AppShell sem escopo aprovado. Corrigir gradualmente, priorizando novas páginas e módulos de maior complexidade.

## Estrutura recomendada por feature

Usar estrutura orientada à feature quando a página tiver mais do que uma responsabilidade visual ou lógica relevante:

```text
web/src/features/<feature>/
├── <Feature>Page.tsx        # composição e coordenação da página
├── components/              # blocos visuais da feature
├── hooks/                   # estado/derivações específicas da feature
├── utils/                   # funções puras, datas, formatação, mapeamentos
└── types.ts                 # tipos partilhados dentro da feature
```

Não é obrigatório criar todas as pastas. Criar apenas módulos necessários. Componentes verdadeiramente reutilizados entre features devem residir numa área compartilhada/design system; componentes específicos ficam dentro da feature. Não criar uma pasta genérica `components` global para componentes que só uma página utiliza.

## Responsabilidades

- **Page:** recebe dependências da aplicação, compõe secções, coordena navegação e estado de alto nível. Deve ser legível como mapa da página.
- **Componentes de apresentação:** renderizam uma secção (KPIs, tabela, modal, filtros, card), recebem props e emitem callbacks; não fazem fetch nem implementam regras financeiras.
- **Hooks da feature:** encapsulam agregação, filtros derivados e coordenação de estado que seria difícil de manter na página. Devem ter contrato claro e ser testáveis.
- **Utilitários:** funções puras sem React para datas, formatação ou transformação simples. Não guardar estado nem aceder à API.
- **Design system:** fornece primitives e padrões transversais. Não duplicar componentes existentes com variantes locais equivalentes.

## Regras para referências visuais

- Usar protótipos/imagens para validar hierarquia, layout, estados e interação.
- Não copiar a estrutura de implementação de um ficheiro HTML de referência para React.
- Adaptar a referência à arquitetura, aos componentes e às convenções do projeto.
- Se a referência e a documentação aprovada divergirem, não escolher silenciosamente: identificar o conflito e pedir decisão.

## Checklist de revisão/aceitação

- [ ] A página é composição de componentes por responsabilidade e não concentra a UI inteira.
- [ ] Lógica de agregação/derivação está fora dos componentes visuais.
- [ ] Componentes recebem dados/callbacks por props; não duplicam regra de domínio.
- [ ] Estado está no menor âmbito adequado; não há estado derivável duplicado.
- [ ] Reutiliza design system/tokens/componentes existentes quando aplicável.
- [ ] Tipos da feature estão organizados e sem duplicação.
- [ ] A referência visual foi adaptada, não copiada como arquitetura.
- [ ] Loading, erro, vazio, limites e comportamento responsivo relevantes foram considerados.
- [ ] Build e lint executados; resultados e limitações registados.

## Aplicação gradual

Esta norma aplica-se imediatamente a novas páginas e alterações estruturais. Páginas existentes podem continuar com estrutura anterior até serem priorizadas para refatoração; a existência de código legado não constitui precedente para novas implementações. A primeira correção desta norma é a Rota Financeira.
