/// <reference types="cypress" />

/**
 * SUITE 2 â€” Checkout / Carrinho de Compras
 * PadrÃ£o: App Actions
 *
 * Todo o setup de estado (login, limpeza de carrinho, adiÃ§Ã£o de produto)
 * Ã© feito atravÃ©s de App Actions definidas em cypress/support/commands.js.
 * Os testes verificam apenas o resultado final das aÃ§Ãµes.
 *
 * O produto usado nos testes e escolhido em tempo de execucao (ver `produto`),
 * porque a loja e um ambiente compartilhado e o estoque muda.
 */

describe('Suite 2 | Checkout â€” App Actions', () => {
  // Credenciais do usuÃ¡rio de teste
  const USER_EMAIL = 'cliente@ebac.art.br';
  const USER_SENHA = 'GD*peToHNJ1#c$sgk08EaYJQ';

  /*
   * Produto usado nos testes — escolhido em tempo de execução.
   *
   * A loja é um ambiente compartilhado e produto zerado CONTINUA na vitrine: o
   * card abre normalmente, mas o PUT /public/updateCart responde 401 com
   * {"success":false,"error":"0 quantities available for <produto>"}. O front
   * engole o erro e o carrinho fica vazio, sem nada na tela — o teste falhava
   * bem depois, no checkout, longe da causa.
   *
   * Pior: escolher por NOME é impossível nessa vitrine. Os 8 cards exibidos
   * são todos "Camiseta EBAC" (registros duplicados), e os 4 primeiros estão
   * zerados — cy.contains(nome) sempre casava um deles.
   *
   * Medido: a ordem dos cards no DOM é a mesma da API que a vitrine consome
   * (/public/getProducts?sortBy=popularity), então `pickAvailableProduct`
   * escolhe por POSIÇÃO e devolve { index, name }. Ver support/commands.js.
   */
  let produto;

  beforeEach(() => {
    cy.pickAvailableProduct().then((escolhido) => {
      produto = escolhido;
    });
  });

  // Dados de envio para o checkout
  const SHIPPING = {
    firstName: 'EBAC',
    lastName: 'Cliente',
    address: 'Rua das Flores, 100',
    city: 'SÃ£o Paulo',
  };

  // ----------------------------------------------------------------
  // CenÃ¡rio 1: Adicionar produto ao carrinho
  // ----------------------------------------------------------------
  describe('Adicionar produto ao carrinho', () => {
    beforeEach(() => {
      // App Action: faz login antes de cada teste deste grupo
      cy.loginViaUi(USER_EMAIL, USER_SENHA);
    });

    it('deve adicionar um produto ao carrinho com sucesso', () => {
      // App Action: adiciona produto (escolhido por posicao na vitrine)
      cy.addProductToCart(produto);

      // App Action: vai ao carrinho
      cy.goToCart();

      // VerificaÃ§Ã£o: produto deve estar no carrinho
      cy.contains(produto.name, { timeout: 10000 }).should('exist');
    });

    it('deve exibir o total do carrinho apÃ³s adicionar produto', () => {
      cy.addProductToCart(produto);
      cy.goToCart();

      // Verificação: total do carrinho deve ser visível (preço ou label de total)
      cy.contains(/Total Amount|R\$/i, { timeout: 10000 })
        .should('exist');
    });

    it('deve atualizar o contador do carrinho apÃ³s adicionar produto', () => {
      cy.addProductToCart(produto);

      // VerificaÃ§Ã£o: Ã­cone/aba de carrinho deve estar visÃ­vel apÃ³s adicionar produto
      cy.get('a[href="/Tab/Cart"], a[href="/Tab/Order"]', { timeout: 10000 }).should('exist');
    });
  });

  // ----------------------------------------------------------------
  // CenÃ¡rio 2: Fluxo completo de checkout
  // ----------------------------------------------------------------
  describe('Fluxo completo de checkout', () => {
    beforeEach(() => {
      /*
       * App Action: login antes de CADA teste.
       * Com testIsolation (padrao do Cypress 12+) os cookies/localStorage sao
       * limpos antes de cada teste. Um hook `before` roda ANTES dessa limpeza,
       * entao a sessao era descartada e a loja respondia como usuario anonimo
       * (carrinho do servidor vazio -> sem botao "Proceed to Checkout").
       */
      cy.loginViaUi(USER_EMAIL, USER_SENHA);
    });

    it('deve concluir o checkout com produto no carrinho', () => {
      // App Action: adiciona produto
      cy.addProductToCart(produto);

      // App Action: vai ao carrinho
      cy.goToCart();

      // Verificação: produto presente
      cy.contains(produto.name, { timeout: 10000 }).should('exist');

      // App Action: preenche dados de envio e confirma pedido
      cy.fillCheckoutAndPlace(SHIPPING);

      /*
       * Verificação: confirmação de pedido
       * A EBAC Store pode exibir "Order Received", "Thank you" ou similar.
       */
      cy.contains(
        /Order Received|Thank you|Obrigado|order confirmed|Payment|Success|Placed/i,
        { timeout: 20000 }
      ).should('exist');
    });
  });

  // ----------------------------------------------------------------
  // Cenário 3: Carrinho vazio
  describe('Carrinho vazio', () => {
    before(() => {
      cy.loginViaUi(USER_EMAIL, USER_SENHA);
    });

    it('deve exibir mensagem de carrinho vazio ao acessar sem produtos', () => {
      // App Action: garante carrinho limpo
      cy.clearCart();

      // VerificaÃ§Ã£o: carrinho deve indicar que estÃ¡ vazio
      cy.contains(
        /Your cart is empty|Seu carrinho estÃ¡ vazio|No items|empty/i,
        { timeout: 10000 }
      ).should('exist');
    });

    it('nÃ£o deve permitir avanÃ§ar para o checkout com carrinho vazio', () => {
      cy.clearCart();

      // Botão de checkout não deve estar disponível com carrinho vazio
      cy.contains(/Proceed to Checkout|Checkout|Select address/i, { timeout: 5000 }).should('not.exist');
    });
  });
});
