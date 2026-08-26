const { defineConfig } = require("cypress");

module.exports = defineConfig({
  /*
   * projectId do Cypress Cloud.
   * Nao e segredo: identifica o projeto e pode ser versionado.
   * O CI sobrescreve via a variavel de ambiente CYPRESS_PROJECT_ID.
   * O segredo (record key) nunca entra aqui - so em CYPRESS_RECORD_KEY.
   */
  projectId: process.env.CYPRESS_PROJECT_ID,

  e2e: {
    baseUrl: "http://lojaebac.ebaconline.art.br",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
  },
});
