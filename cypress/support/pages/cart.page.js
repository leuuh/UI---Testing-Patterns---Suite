/// <reference types="cypress" />

/**
 * PAGE OBJECT: CartPage
 *
 * Encapsula todos os seletores e ações relacionados
 * ao fluxo de checkout (carrinho de compras) da EBAC Store.
 *
 * Nota: Usado como referência interna para os seletores,
 * mas as AÇÕES são exercidas via App Actions (commands.js).
 *
 * Interface real verificada (2026-04-01):
 * - Aba loja: a[href="/Tab/Browse"] (não /Tab/Shop)
 * - Botão add: "Add To Cart"
 * - Produtos: "Camiseta EBAC", "Tênis Esportivo"
 */
class CartPage {
  // ---------- Seletores de Produto ----------

  get browseTab() {
    return cy.get('a[href="/Tab/Browse"]', { timeout: 15000 });
  }

  productCard(productName) {
    return cy.contains(productName, { timeout: 10000 });
  }

  get addToCartButton() {
    return cy.contains(/Add To Cart/i, { timeout: 10000 });
  }

  // ---------- Seletores do Carrinho ----------

  get cartIcon() {
    // Carrinho pode aparecer como link ou ícone no canto superior
    return cy.get('a[href="/Tab/Cart"], a[href="/Tab/Order"]', { timeout: 10000 });
  }

  get cartItems() {
    return cy.get('[class*="CartItem"], [class*="cart-item"], [class*="item"]', { timeout: 10000 });
  }

  get cartTotal() {
    return cy.get('[class*="total"], [class*="Total"], [class*="price"], [class*="Price"]', { timeout: 10000 });
  }

  get proceedToCheckoutButton() {
    return cy.contains(/Proceed to Checkout|Checkout/i, { timeout: 10000 });
  }

  // ---------- Seletores de Checkout ----------

  get shippingFirstName() {
    return cy.get('input[placeholder="First Name"]', { timeout: 10000 });
  }

  get shippingLastName() {
    return cy.get('input[placeholder="Last Name"]', { timeout: 10000 });
  }

  get shippingAddress() {
    return cy.get('input[placeholder="Address"]', { timeout: 10000 });
  }

  get shippingCity() {
    return cy.get('input[placeholder="City"]', { timeout: 10000 });
  }

  get placeOrderButton() {
    return cy.contains(/Place Order/i, { timeout: 10000 });
  }

  get orderConfirmation() {
    return cy.contains(/Order Received|Thank you|order confirmed/i, { timeout: 20000 });
  }
}

module.exports = new CartPage();
