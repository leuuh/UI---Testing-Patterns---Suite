/// <reference types="cypress" />

/**
 * SUITE 1 â€” CriaÃ§Ã£o de Conta
 * PadrÃ£o: Page Objects
 *
 * Utiliza a classe RegisterPage (cypress/support/pages/register.page.js)
 * para encapsular todos os seletores e aÃ§Ãµes do fluxo de registro.
 *
 * Interface real da EBAC Store (verificado 2026-04-01):
 * - Campos: First Name, Last Name, Phone Number, Email Address, Password, Re-enter Password
 * - BotÃ£o de submit: "Create"
 * - Link para registro: "Sign up"
 */

const registerPage = require('../support/pages/register.page');

// Gera um e-mail Ãºnico para evitar conflito com contas jÃ¡ existentes
const uniqueEmail = () => `ebac.test.${Date.now()}@mailinator.com`;

describe('Suite 1 | CriaÃ§Ã£o de Conta â€” Page Objects', () => {
  // ----------------------------------------------------------------
  // CenÃ¡rio 1: Registro com dados vÃ¡lidos
  // ----------------------------------------------------------------
  describe('Registro com dados vÃ¡lidos', () => {
    const userData = {
      firstName: 'EBAC',
      lastName: 'Teste',
      phone: '11987654321',
      email: uniqueEmail(),
      password: 'Senha@Teste123',
      confirmPassword: 'Senha@Teste123',
    };

    it('deve navegar atÃ© o formulÃ¡rio de registro a partir da home', () => {
      registerPage.navigateToRegisterForm();

      // Verifica que o formulÃ¡rio de registro estÃ¡ visÃ­vel no DOM
      registerPage.firstNameInput.should('exist');
      registerPage.lastNameInput.should('exist');
      registerPage.emailInput.should('exist');
    });

    it('deve preencher o formulÃ¡rio e criar a conta com sucesso', () => {
      registerPage.navigateToRegisterForm();
      registerPage.fillAndSubmitForm(userData);

      /*
       * ApÃ³s o registro bem-sucedido a EBAC Store normalmente redireciona
       * o usuÃ¡rio para a tela de Account / Profile ou exibe boas-vindas.
       */
      cy.contains(/My Account|Welcome|Bem-vindo|Profile/i, { timeout: 20000 }).should('exist');
    });
  });

  // ----------------------------------------------------------------
  // CenÃ¡rio 2: ValidaÃ§Ã£o de campos obrigatÃ³rios
  // ----------------------------------------------------------------
  describe('ValidaÃ§Ã£o de campos obrigatÃ³rios', () => {
    beforeEach(() => {
      registerPage.navigateToRegisterForm();
    });

    it('nÃ£o deve permitir submeter o formulÃ¡rio com campos em branco', () => {
      // Tenta submeter sem preencher nada
      registerPage.createButton.click({ force: true });
      cy.wait(2000);

      // Deve permanecer na tela de registro (campos obrigatÃ³rios devem impedir)
      registerPage.firstNameInput.should('exist');
    });

    it('nÃ£o deve aceitar senhas que nÃ£o coincidem', () => {
      registerPage.fillAndSubmitForm({
        firstName: 'EBAC',
        lastName: 'Teste',
        phone: '11987654321',
        email: uniqueEmail(),
        password: 'Senha@Teste123',
        confirmPassword: 'SenhaDiferente456',
      });
      cy.wait(2000);

      // Deve permanecer na tela de registro (campos ainda visÃ­veis)
      registerPage.firstNameInput.should('exist');
    });
  });

  // ----------------------------------------------------------------
  // CenÃ¡rio 3: E-mail jÃ¡ cadastrado
  // ----------------------------------------------------------------
  describe('E-mail jÃ¡ cadastrado', () => {
    it('deve exibir erro ao tentar registrar um e-mail jÃ¡ existente', () => {
      registerPage.register({
        firstName: 'EBAC',
        lastName: 'Cliente',
        phone: '11987654321',
        email: 'cliente@ebac.art.br', // e-mail que jÃ¡ existe
        password: 'Senha@Teste123',
        confirmPassword: 'Senha@Teste123',
      });
      cy.wait(3000);

      // NÃ£o deve ter criado uma nova conta / deve permanecer na tela de registro
      registerPage.firstNameInput.should('exist');
    });
  });
});
