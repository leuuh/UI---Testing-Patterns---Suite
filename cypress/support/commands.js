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

// O app mantem no DOM copias invisiveis (0x0) dos mesmos textos. cy.contains()
// devolve so o PRIMEIRO match, entao filtrar ':visible' depois zera o resultado.
// Passar ':visible' como seletor faz a busca ja ignorar os elementos ocultos.
const visibleText = (text, timeout = 10000) => (
  cy.contains(':visible', text, { timeout }).first()
);

const hasVisibleElement = ($body, selector) => (
  $body.find(selector).filter((_, element) => Cypress.$(element).is(':visible')).length > 0
);

/*
 * Nomes dos produtos que a loja REALMENTE desenha como card na vitrine.
 *
 * Medido: /public/getProducts devolve 31 nomes, mas a UI so renderiza um
 * subconjunto. "Fish" (type=popular) existe como UNICO no do DOM, 0x0,
 * invisivel em Home e Browse - clicar nele exigia force:true e nao testava
 * nada. Por isso a fonte de verdade aqui e o DOM, nao a API: so o que tem card
 * com preco visivel pode ser clicado por um usuario de verdade.
 *
 * Um card = um preco visivel. Nao da pra escolher pelo NOME: a vitrine mostra
 * 8 cards todos chamados "Camiseta EBAC" (registros duplicados), entao
 * cy.contains(nome) sempre casa o primeiro - e os primeiros estao zerados.
 * Medido: a ordem dos cards no DOM e a mesma da API, logo o card N corresponde
 * ao produto N. E por isso que a escolha aqui e por POSICAO, nao por nome.
 */
const cardsDaVitrine = ($body) => {
  const textoDe = (element) => (element.innerText || element.textContent || '').trim();
  const ehPreco = (texto) => /^R\$\s?\d/.test(texto);

  return [...$body[0].querySelectorAll('*')].filter((element) => (
    element.children.length === 0
    && Cypress.$(element).is(':visible')
    && ehPreco(textoDe(element))
  ));
};

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
      cy.wrap(cartButton).click();
    }
  });
};

const goToVisibleCart = () => {
  visibleElement('a[href="/Tab/Browse"]', 15000).click();
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

    cy.wrap(removeButtons[0]).click();
    cy.wait(1000);
    removeVisibleCartItems(attempt + 1);
  });
};

Cypress.Commands.add('loginViaUi', (email, senha) => {
  useStoreV2();
  cy.visit('/', { failOnStatusCode: false });
  cy.wait(3000);

  visibleElement('a[href="/Tab/Account"]', 15000).click();
  cy.wait(2000);

  visibleElement('input[placeholder="Email"]', 15000).clear({ force: true }).type(email, { force: true });
  visibleElement('input[placeholder="Password"]').clear({ force: true }).type(senha, { force: true });
  visibleText(/^Login$/).click();
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

// Devolve o nome de um produto REALMENTE clicavel: o que a vitrine desenha como
// card. Evita o teste depender de um produto fixo, que mais cedo ou mais tarde
// zera o estoque e some da vitrine.
// A vitrine tem nomes repetidos com estoques diferentes (existem 8 "Camiseta
// EBAC"), e o card sempre abre a PRIMEIRA ocorrencia do nome nesta ordenacao.
// Se essa primeira ocorrencia estiver zerada, o PUT /updateCart devolve 401 e o
// carrinho fica vazio sem nenhum erro na tela - por isso o estoque e conferido
// aqui, antes de escolher o produto.
const VITRINE_API = `http://${STORE_DOMAIN}/public/getProducts?sortBy=popularity`;

Cypress.Commands.add('pickAvailableProduct', () => {
  useStoreV2();
  cy.visit('/', { failOnStatusCode: false });
  cy.wait(3000);

  visibleElement('a[href="/Tab/Browse"]', 15000).click();
  cy.wait(3000);

  return cy.request(VITRINE_API).then((resposta) => {
    const produtos = resposta.body.products || [];

    return cy.get('body').then(($body) => {
      const cards = cardsDaVitrine($body);

      expect(cards, 'cards visiveis na vitrine').to.not.be.empty;

      const index = produtos
        .slice(0, cards.length)
        .findIndex((produto) => Number(produto.quantity) > 0);

      expect(index, 'card visivel na vitrine com estoque disponivel').to.be.at.least(0);

      return { index, name: (produtos[index].name || '').trim() };
    });
  });
});

// NAO usar cy.visit aqui. O reload reinicializa o app como anonimo: ele pede um
// novo getTempUserId e o PUT /updateCart grava no carrinho temporario, enquanto
// o checkout le o carrinho do usuario logado (que fica vazio).
Cypress.Commands.add('addProductToCart', ({ index }) => {
  visibleElement('a[href="/Tab/Browse"]', 15000).click();
  cy.wait(2000);

  // Clique no card pela POSICAO (ver cardsDaVitrine): por nome abriria sempre a
  // primeira "Camiseta EBAC", que esta zerada - o Add To Cart nao faz nada.
  cy.get('body').then(($body) => {
    const cards = cardsDaVitrine($body);

    expect(cards[index], `card visivel na posicao ${index}`).to.exist;

    cy.wrap(cards[index]).click();
  });
  cy.wait(1500);

  visibleText(/^Add To Cart$/i, 10000).click();
  cy.wait(2000);
});

Cypress.Commands.add('goToCart', () => {
  useStoreV2();
  goToVisibleCart();
  cy.wait(2000);
});

Cypress.Commands.add('fillCheckoutAndPlace', ({ firstName, lastName, address, city }) => {
  visibleText(/Proceed to Checkout|Checkout|Select address|Continue to payment/i, 10000).click();
  cy.wait(2000);

  cy.get('body', { timeout: 10000 }).then(($body) => {
    if (!hasVisibleElement($body, 'input[placeholder="First Name"]')) {
      return;
    }

    visibleElement('input[placeholder="First Name"]').clear({ force: true }).type(firstName, { force: true });
    visibleElement('input[placeholder="Last Name"]').clear({ force: true }).type(lastName, { force: true });
    visibleElement('input[placeholder="Address"]').clear({ force: true }).type(address, { force: true });
    visibleElement('input[placeholder="City"]').clear({ force: true }).type(city, { force: true });
    visibleText(/Place Order|Continue|Continue to payment|Checkout/i, 10000).click();
    cy.wait(2000);
  });

  cy.get('body', { timeout: 10000 }).then(($body) => {
    const pageText = $body.text();

    if (/Payment Option|Cash on Delivery|Price Details/i.test(pageText)) {
      visibleText(/^Checkout$/i, 10000).click();
    }
  });

  cy.wait(3000);
});
