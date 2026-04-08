# UI Testing Patterns - Suite 2

Projeto de automacao E2E com Cypress para a EBAC Store, cobrindo dois padroes:

- Suite 1: criacao de conta com Page Objects
- Suite 2: checkout e carrinho com App Actions

## Stack

- Node.js
- Cypress
- cypress-real-events

## Estrutura

- `cypress/e2e/CriacaoDeConta.cy.js`: fluxo de cadastro
- `cypress/e2e/Checkout.cy.js`: fluxo de checkout
- `cypress/support/pages/`: page objects reutilizaveis
- `cypress/support/commands.js`: app actions e comandos customizados

## Como executar

```bash
npm install
npm run test:conta
npm run test:checkout
```

Para executar toda a suite:

```bash
npm test
```

## Ambiente alvo

- Base URL: `http://lojaebac.ebaconline.art.br`
