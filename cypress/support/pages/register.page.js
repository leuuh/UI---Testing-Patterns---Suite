/// <reference types="cypress" />

/**
 * PAGE OBJECT: RegisterPage
 *
 * Encapsula todos os seletores e aÃ§Ãµes relacionados
 * Ã  pÃ¡gina / fluxo de criaÃ§Ã£o de conta da EBAC Store.
 *
 * Mapeamento real da interface (verificado em 2026-04-01):
 * - NavegaÃ§Ã£o inferior: Home | Browse | Order | Profile
 * - Link para cadastro: "Sign up"
 * - Campos: First Name, Last Name, Phone Number, Email Address, Password, Re-enter Password
 * - BotÃ£o de submit: "Create"
 */
class RegisterPage {
  // ---------- Seletores ----------

  visibleInput(selector, timeout = 10000) {
    return cy.get(selector, { timeout }).filter(':visible').first();
  }

  visibleText(text, timeout = 10000) {
    return cy.contains(text, { timeout }).filter(':visible').first();
  }

  get profileTab() {
    return cy.get('a[href="/Tab/Account"]', { timeout: 15000 });
  }

  get signUpLink() {
    // Link "Sign up" na tela de login
    return this.visibleText('Sign up');
  }

  get firstNameInput() {
    return this.visibleInput('input[placeholder="First Name"]');
  }

  get lastNameInput() {
    return this.visibleInput('input[placeholder="Last Name"]');
  }

  get phoneNumberInput() {
    return this.visibleInput('input[placeholder="Phone Number"]');
  }

  get emailInput() {
    // Na tela de registro o campo usa "Email Address"
    return this.visibleInput('input[placeholder="Email Address"]');
  }

  get passwordInput() {
    return this.visibleInput('input[placeholder="Password"]');
  }

  get confirmPasswordInput() {
    // Campo de confirmaÃ§Ã£o usa "Re-enter Password"
    return this.visibleInput('input[placeholder="Re-enter Password"]');
  }

  get createButton() {
    // BotÃ£o de submit do registro Ã© "Create"
    return cy.contains(/^Create$/, { timeout: 10000 });
  }

  // Mantido como alias para compatibilidade com testes existentes
  get registerButton() {
    return this.createButton;
  }

  get successMessage() {
    return cy.contains(/My Account|Welcome|Bem-vindo/i, { timeout: 20000 });
  }

  get errorMessage() {
    return cy.get('.error, [class*="error"], [class*="Error"]', { timeout: 10000 });
  }

  // ---------- AÃ§Ãµes ----------

  /**
   * Navega atÃ© a tela de registro a partir da home.
   */
  navigateToRegisterForm() {
    cy.setCookie('EbacStoreVersion', 'v2', { domain: 'lojaebac.ebaconline.art.br' });
    cy.visit('/', { failOnStatusCode: false });
    cy.wait(3000);
    // Clica na aba Profile/Account para abrir o login
    this.profileTab.should('exist').click({ force: true });
    cy.wait(2000);
    // Clica em "Sign up" para ir para o formulÃ¡rio de registro
    this.signUpLink.should('exist').click({ force: true });
    cy.wait(2000);
  }

  /**
   * Preenche o formulÃ¡rio de criaÃ§Ã£o de conta e submete.
   * @param {object} userData - { firstName, lastName, phone, email, password, confirmPassword }
   */
  fillAndSubmitForm({ firstName, lastName, phone = '11999999999', email, password, confirmPassword }) {
    this.firstNameInput.should('exist').clear({ force: true }).type(firstName, { force: true });
    this.lastNameInput.should('exist').clear({ force: true }).type(lastName, { force: true });
    this.phoneNumberInput.should('exist').clear({ force: true }).type(phone, { force: true });
    this.emailInput.should('exist').clear({ force: true }).type(email, { force: true });
    this.passwordInput.should('exist').clear({ force: true }).type(password, { force: true });
    this.confirmPasswordInput.should('exist').clear({ force: true }).type(confirmPassword, { force: true });
    this.createButton.click({ force: true });
  }

  /**
   * Fluxo completo: navegar + preencher + submeter.
   */
  register(userData) {
    this.navigateToRegisterForm();
    this.fillAndSubmitForm(userData);
  }
}

module.exports = new RegisterPage();
