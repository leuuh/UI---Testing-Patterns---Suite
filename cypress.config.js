const { defineConfig } = require("cypress");

module.exports = defineConfig({
  /*
   * projectId do Cypress Cloud.
   * Nao e segredo: identifica o projeto e pode ser versionado.
   * O CI sobrescreve via a variavel de ambiente CYPRESS_PROJECT_ID.
   * O segredo (record key) nunca entra aqui - so em CYPRESS_RECORD_KEY.
   */
  projectId: "2hz02q",

  /*
   * Sem retries o Cypress Cloud nao tem como classificar um teste como flaky:
   * a deteccao depende de ver o mesmo teste falhar e passar na mesma execucao.
   * Vale so em runMode - no modo interativo o retry esconde o erro do dev.
   */
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    baseUrl: "http://lojaebac.ebaconline.art.br",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
  },
});
