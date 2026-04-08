// ***********************************************
// App Actions & custom commands
// ***********************************************

import 'cypress-real-events';

Cypress.on('uncaught:exception', () => false);

const STORE_DOMAIN = 'lojaebac.ebaconline.art.br';

const useStoreV2 = () => {
  cy.setCookie('EbacStoreVersion', 'v2', { domain: STORE_DOMAIN });
};

const visibleElement = (selector, timeout = 10000) => (
  cy.get(selector, { timeout }).filter(':visible').first()
);

const visibleText = (text, timeout = 10000) => (
  cy.contains(text, { timeout }).filter(':visible').first()
);

const hasVisibleElement = ($body, selector) => (
  $body.find(selector).filter((_, element) => Cypress.$(element).is(':visible')).length > 0
);

const clickBrowseHeaderCart = () => {
  cy.get('body').then(($body) => {
    const documentWidth = $body[0].ownerDocument.documentElement.clientWidth;
    const headerButtons = [...$body.find('div[tabindex="0"]')].filter((element) => {
      const rect = element.getBoundingClientRect();

      return (
        rect.top >= 0 &&
        rect.top < 60 &&
        rect.left > documentWidth - 120 &&
        rect.width > 0 &&
        rect.height > 0
      );
    });
    const cartButton = headerButtons[headerButtons.length - 1];

    if (cartButton) {
      cy.wrap(cartButton).click({ force: true });
    }
  });
};

const goToVisibleCart = () => {
  visibleElement('a[href="/Tab/Browse"]', 15000).click({ force: true });
  cy.wait(1000);
  clickBrowseHeaderCart();
};

const removeVisibleCartItems = (attempt = 0) => {
  cy.get('body').then(($body) => {
    const removeButtons = $body.find('div:visible').filter((_, element) => (
      (element.innerText || element.textContent || '').trim() === 'Remove'
    ));

    if (removeButtons.length === 0 || attempt >= 20) {
      return;
    }

    cy.wrap(removeButtons[0]).click({ force: true });
    cy.wait(1000);
    removeVisibleCartItems(attempt + 1);
  });
};

Cypress.Commands.add('loginViaUi', (email, senha) => {
  useStoreV2();
  cy.visit('/', { failOnStatusCode: false });
  cy.wait(3000);

  visibleElement('a[href="/Tab/Account"]', 15000).click({ force: true });
  cy.wait(2000);

  visibleElement('input[placeholder="Email"]', 15000).clear({ force: true }).type(email, { force: true });
  visibleElement('input[placeholder="Password"]').clear({ force: true }).type(senha, { force: true });
  visibleText(/^Login$/).click({ force: true });
  cy.wait(5000);
});

Cypress.Commands.add('clearCart', () => {
  useStoreV2();
  cy.visit('/', { failOnStatusCode: false });
  cy.wait(2000);

  goToVisibleCart();
  cy.wait(2000);

  removeVisibleCartItems();
});

Cypress.Commands.add('addProductToCart', (productName) => {
  useStoreV2();
  cy.visit('/', { failOnStatusCode: false });
  cy.wait(3000);

  visibleElement('a[href="/Tab/Browse"]', 15000).click({ force: true });
  cy.wait(2000);

  cy.contains(productName, { timeout: 10000 }).click({ force: true });
  cy.wait(1500);

  cy.contains(/Add To Cart/i, { timeout: 10000 }).click({ force: true });
  cy.wait(2000);
});

Cypress.Commands.add('goToCart', () => {
  useStoreV2();
  goToVisibleCart();
  cy.wait(2000);
});

Cypress.Commands.add('fillCheckoutAndPlace', ({ firstName, lastName, address, city }) => {
  visibleText(/Proceed to Checkout|Checkout|Select address|Continue to payment/i, 10000).click({ force: true });
  cy.wait(2000);

  cy.get('body', { timeout: 10000 }).then(($body) => {
    if (!hasVisibleElement($body, 'input[placeholder="First Name"]')) {
      return;
    }

    visibleElement('input[placeholder="First Name"]').clear({ force: true }).type(firstName, { force: true });
    visibleElement('input[placeholder="Last Name"]').clear({ force: true }).type(lastName, { force: true });
    visibleElement('input[placeholder="Address"]').clear({ force: true }).type(address, { force: true });
    visibleElement('input[placeholder="City"]').clear({ force: true }).type(city, { force: true });
    visibleText(/Place Order|Continue|Continue to payment|Checkout/i, 10000).click({ force: true });
    cy.wait(2000);
  });

  cy.get('body', { timeout: 10000 }).then(($body) => {
    const pageText = $body.text();

    if (/Payment Option|Cash on Delivery|Price Details/i.test(pageText)) {
      visibleText(/^Checkout$/i, 10000).click({ force: true });
    }
  });

  cy.wait(3000);
});
