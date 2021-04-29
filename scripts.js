(async () => {
  const getGameData = async function (json) {
    const response = await fetch(json);
    const results = await response.json();
    return results;
  };
  const getCartData = async function (json) {
    const response = await fetch(json);
    const results = await response.json();
    return results;
  };

  const gamesData = await getGameData('./games.json');
  const cartData = await getCartData('http://localhost:3000/games');

  const description = document.querySelector('.description-container');
  const gameName = document.querySelector('.game-name-container');
  const selectGameButtons = [...document.querySelectorAll('.select-game')];
  const numbersSection = document.querySelector('.numbers-section');
  const clearGameButton = document.querySelector('.clear-game');
  const addToCartButton = document.querySelector('.add-to-cart');
  const cartContent = document.querySelector('.cart-content');

  selectGameButtons.forEach((button) => {
    button.addEventListener('click', selectedGame);
  });
  clearGameButton.addEventListener('click', clearGame);
  addToCartButton.addEventListener('click', addToCart);

  function loadGameContent() {
    let activetedButton = selectGameButtons.find((element) => {
      return element.hasAttribute('active');
    }).id;
    gameName.innerHTML = `<h2>NEW BET</h2>
    <h2 class="game-name">FOR ${activetedButton.toUpperCase()}</h2>`;
    description.innerHTML = `<h4>Fill your bet</h4>
    <h4 class="game-description">${
      gamesData['types'].find((element) => {
        return element['type'] == activetedButton;
      })['description']
    }</h4>`;

    range = gamesData['types'].find((element) => {
      return element['type'] == activetedButton;
    })['range'];

    displayNumbers(range);
  }

  function selectedGame(event) {
    selectGameButtons.forEach((button) => {
      button.removeAttribute('active');
    });
    event.target.setAttribute('active', 'true');
    loadGameContent();
  }

  function displayNumbers(range) {
    let numbersCells = '';
    for (let i = 1; i <= range; i++) {
      numbersCells += `<button class="numbers-cell" id=${i}>${i}</button>`;
    }
    numbersSection.innerHTML = numbersCells;

    const numbersSelectButton = [...document.querySelectorAll('.numbers-cell')];
    numbersSelectButton.forEach((button) => {
      button.addEventListener('click', selectedNumber);
    });
  }

  function selectedNumber(event) {
    let selectedGame = selectGameButtons.find((game) => {
      return game.hasAttribute('active');
    }).id;

    let selectedButtons = [...document.querySelectorAll('[selected]')].length;

    let selectedGameData = gamesData['types'].find((game) => {
      return game['type'] === selectedGame;
    });

    console.log(selectedButtons);
    if (event.target.hasAttribute('selected')) {
      return event.target.removeAttribute('selected');
    }

    if (selectedButtons === selectedGameData['max-number']) {
      return window.alert(
        'Você já selecionou a quantidade máxima de números por jogo, caso queira trocar algum número você precisa primeiro desmarcar algum.'
      );
    }

    event.target.setAttribute('selected', 'true');
  }

  function clearGame() {
    const numberButtons = document.querySelectorAll('.numbers-cell');

    numberButtons.forEach((button) => {
      button.removeAttribute('selected');
    });
  }

  async function addToCart() {
    const selectedGame = selectGameButtons.find((game) => {
      return game.hasAttribute('active');
    }).id;
    const selectedGameData = gamesData['types'].find((game) => {
      return game['type'] === selectedGame;
    });
    const selectedNumbers = [...document.querySelectorAll('[selected]')].map(
      (button) => {
        return button.id;
      }
    );

    const teste = await fetch('http://localhost:3000/games', {
      mode: 'cors',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game: selectedGame,
        numbers: selectedNumbers,
        value: selectedGameData['price'],
      }),
    });
    loadCartContent(selectedNumbers, selectedGame);
    return;

    // window.alert('Você não selecionou números suficiente.');
  }

  function loadCartContent() {
    console.log(cartData);
    let cartGames = cartData
      .map((element) => {
        return `<div class="game-card"><i class="material-icons" id=${
          element.id
        }>delete</i><div class="cart-divisor"></div><div class="game-infos"><h4>${element[
          'numbers'
        ].join(', ')}</h4><h4>${element['game']}</h4></div></div>`;
      })
      .join('');

    cartContent.innerHTML = `<h2>CART</h2> ${cartGames}`;

    const deleteGameButton = [...document.querySelectorAll('i')];

    deleteGameButton.forEach((button) => {
      button.addEventListener('click', deleteGame);
    });
  }

  function deleteGame() {}

  loadCartContent();
  loadGameContent();
})();
