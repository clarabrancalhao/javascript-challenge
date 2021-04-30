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

  const description = document.querySelector('.description-container');
  const gameName = document.querySelector('.game-name-container');
  const selectGameButtons = getElements('.select-game');
  const numbersSection = document.querySelector('.numbers-section');
  const clearGameButton = document.querySelector('.clear-game');
  const addToCartButton = document.querySelector('.add-to-cart');
  const cartContent = document.querySelector('.cart-content');
  const completeGame = document.querySelector('.complete-game');
  const saveButton = document.querySelector('.save-button');

  clearGameButton.addEventListener('click', clearGame);
  addToCartButton.addEventListener('click', addToCart);
  completeGame.addEventListener('click', getRandomNumbers);
  saveButton.addEventListener('click', saveCart);
  selectGameButtons.forEach((button) => {
    button.addEventListener('click', selectedGame);
  });

  function loadGameContent() {
    const selectedGame = getSelectedGame();
    gameName.innerHTML = `<h2>NEW BET</h2>
    <h2 class="game-name">FOR ${selectedGame['type'].toUpperCase()}</h2>`;
    description.innerHTML = `<h4>Fill your bet</h4>
    <h4 class="game-description">${selectedGame['description']}</h4>`;

    const range = selectedGame['range'];

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

    const numbersSelectButton = getElements('.numbers-cell');
    numbersSelectButton.forEach((button) => {
      button.addEventListener('click', selectedNumber);
    });
  }

  function getElements(attribute) {
    return [...document.querySelectorAll(attribute)];
  }

  function selectedNumber(event) {
    const selectedButtons = getElements('[selected]').length;
    const selectedGameData = getSelectedGame();

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
    const numberButtons = getElements('.numbers-cell');

    numberButtons.forEach((button) => {
      button.removeAttribute('selected');
    });
  }

  function getSelectedGame() {
    const selectedGame = selectGameButtons.find((game) => {
      return game.hasAttribute('active');
    }).id;
    return gamesData['types'].find((game) => {
      return game['type'] === selectedGame;
    });
  }

  async function addToCart() {
    const selectedGameData = getSelectedGame();
    const selectedNumbers = getElements('[selected]').map((button) => {
      return button.id;
    });

    const addGametoCart = await fetch('http://localhost:3000/games', {
      mode: 'cors',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game: selectedGameData['type'],
        numbers: selectedNumbers,
        price: selectedGameData['price'],
      }),
    });
    await loadCartContent();
    clearGame();
  }

  async function loadCartContent() {
    const cartData = await getCartData('http://localhost:3000/games');
    const cartGamesCompleted = cartData
      .map((element) => {
        return `<div class="game-card"><i class="material-icons-outlined" id=${
          element.id
        }>delete</i><div class="cart-divisor" game=${
          element['game']
        }></div><div class="game-infos"><h4 class="cart-numbers">${element[
          'numbers'
        ].join(', ')}</h4><div class="game-name-price"><h4 game=${
          element['game']
        }>${element['game']}</h4><h4 class="game-price">R$${
          element['price']
        }</h4></div></div></div>`;
      })
      .join('');

    cartContent.innerHTML = `<h2>CART</h2> ${cartGamesCompleted}`;

    const deleteGameFromCartButton = getElements('i');

    deleteGameFromCartButton.forEach((button) => {
      button.addEventListener('click', deleteGame);
    });

    const finalValue = await getFinalValue();

    const finalValueElement = document.querySelector('.final-value-container');
    finalValueElement.innerHTML = `<h2>CART</h2>
    <h2 class="total">TOTAL:R$${finalValue}</h2>`;
  }

  async function getFinalValue() {
    const cartData = await getCartData('http://localhost:3000/games');
    if ([...cartData].length == 0) {
      return '00,00';
    }
    return [
      ...cartData.map((element) => {
        return element['price'];
      }),
    ].reduce((acc, cur) => {
      return acc + cur;
    });
  }

  async function deleteGame(event) {
    console.log('aaaaaa');
    const deleted = await fetch(
      `http://localhost:3000/games/${event.target.id}`,
      {
        method: 'DELETE',
      }
    );
    await loadCartContent();
  }

  function getRandomNumbers() {
    const numberCells = getElements('.numbers-cell');
    const selectedGameData = getSelectedGame();

    let randomNumbers = [];

    for (let i = 1; i < selectedGameData['max-number']; i) {
      const random =
        Math.floor(Math.random() * (selectedGameData['range'] - 1)) + 1;
      randomNumbers.push(random);
      randomNumbers = [...new Set(randomNumbers)];
      i = randomNumbers.length;
    }

    const activedButtons = numberCells.filter((element) => {
      return randomNumbers.includes(Number(element.id));
    });

    clearGame();

    activedButtons.forEach((button) => {
      button.setAttribute('selected', 'true');
    });
  }

  async function saveCart() {
    const cartValue = await getFinalValue();
    if (cartValue < gamesData['min-cart-value']) {
      return window.alert(
        `The minimum value to make the purchase is ${gamesData['min-cart-value']} reais`
      );
    }
    console.log('deu certooo');
  }

  loadCartContent();
  loadGameContent();
})();
