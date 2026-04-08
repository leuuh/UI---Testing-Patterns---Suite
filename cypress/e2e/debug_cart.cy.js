/// <reference types="cypress" />

describe('debug cart selectors', () => {
  it('writes cart page after clear cart', () => {
    cy.loginViaUi('cliente@ebac.art.br', 'GD*peToHNJ1#c$sgk08EaYJQ');
    cy.clearCart();

    cy.get('body').then(($body) => {
      cy.writeFile('debug_cart_dom.json', {
        url: $body[0].ownerDocument.location.href,
        text: $body.text().replace(/\s+/g, ' ').trim(),
      });
    });
  });
});
