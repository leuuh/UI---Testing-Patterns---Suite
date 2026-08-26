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

## Cypress Cloud (relatorios)

As execucoes sao gravadas no Cypress Cloud para gerar o historico de metricas
(duracao, taxa de falha, deteccao de flaky e comparacao entre execucoes).

### Configuracao

Duas variaveis, com papeis diferentes:

| Variavel | O que e | Onde vive |
|---|---|---|
| `CYPRESS_PROJECT_ID` | Identificador publico do projeto no Cloud | Variavel do repositorio (Settings > Variables) |
| `CYPRESS_RECORD_KEY` | **Segredo**. Autoriza a gravacao | Secret do repositorio (Settings > Secrets) |

A record key nunca e versionada. Sem ela o `--record` falha, e falha alto:
e o comportamento desejado, melhor que gravar em silencio no projeto errado.

### Rodar gravando

```bash
export CYPRESS_PROJECT_ID=<id-do-projeto>
export CYPRESS_RECORD_KEY=<record-key>
npm run cy:record
```

No CI a gravacao acontece no workflow `.github/workflows/cypress-cloud.yml`,
que marca cada execucao com `--tag ci,<branch>` para permitir segmentar as
metricas por origem no painel do Cloud.
