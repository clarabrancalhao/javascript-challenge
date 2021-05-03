(async () => {
  async function getData(json) {
    const response = await fetch(json);
    const results = await response.json();
    return results;
  }

  const gamesData = await getData('./games.json');
  let selectedGame = [];

  //Elements
  const description = document.querySelector('.description-container');
  const gameName = document.querySelector('.game-name-container');
  let selectGameButtons = [];
  let deleteButtons;
  const selectGameButtonsContainer = document.querySelector(
    '.select-game-container'
  );
  const numbersSection = document.querySelector('.numbers-section');
  const clearGameButton = document.querySelector('.clear-game');
  const addToCartButton = document.querySelector('.add-to-cart');
  const cartContent = document.querySelector('.cart-content');
  const completeGame = document.querySelector('.complete-game');
  const saveButton = document.querySelector('.save-button');

  //Event Listeners
  clearGameButton.addEventListener('click', clearGame);
  addToCartButton.addEventListener('click', addToCart);
  completeGame.addEventListener('click', getRandomNumbers);
  saveButton.addEventListener('click', saveCart);
  selectGameButtons.forEach((button) => {
    button.addEventListener('click', selectGame);
  });

  //Functions
  function loadGameContent() {
    gameName.innerHTML = `<h2>NEW BET</h2>
    <h2 class="game-name">FOR ${selectedGame['type'].toUpperCase()}</h2>`;
    description.innerHTML = `<h4>Fill your bet</h4>
    <h4 class="game-description">${selectedGame['description']}</h4>`;

    const range = selectedGame['range'];

    displayNumbers(range);
  }

  function loadSelectButtons() {
    selectGameButtonsContainer.innerHTML = [...gamesData['types']]
      .map((game, index) => {
        return index === 0
          ? `<button class="select-game" active="true" id=${game['type']} style="color: #FFFFFF; background:${game['color']}; border: 2px solid ${game['color']}">${game['type']}</button>`
          : `<button class="select-game" id=${game['type']} style="color: ${game['color']}; border: 2px solid ${game['color']}">${game['type']}</button>`;
      })
      .join('');

    selectGameButtons = getElements('.select-game');
    selectGameButtons.forEach((button) => {
      button.addEventListener('click', selectGame);
    });

    getSelectedGame();
  }

  function selectGame(event) {
    selectGameButtons.forEach((button, index) => {
      button.removeAttribute('active');
      button.style.background = '#FFFFFF';
      button.style.color = gamesData['types'][index]['color'];
    });
    event.target.setAttribute('active', 'true');
    getSelectedGame();
    event.target.style.background = selectedGame['color'];
    event.target.style.color = '#FFFFFF';
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
      button.addEventListener('click', selectNumber);
    });
  }

  function getElements(attribute) {
    return [...document.querySelectorAll(attribute)];
  }

  function selectNumber(event) {
    const selectedButtons = getElements('[selected]').length;

    if (event.target.hasAttribute('selected')) {
      event.target.style.background = '#adc0c4';
      return event.target.removeAttribute('selected');
    }

    if (selectedButtons === selectedGame['max-number']) {
      return window.alert(
        'Você já selecionou a quantidade máxima de números por jogo, caso queira trocar algum número você precisa primeiro desmarcar algum.'
      );
    }
    event.target.style.background = selectedGame['color'];
    event.target.setAttribute('selected', 'true');
  }

  function clearGame() {
    const numberButtons = getElements('.numbers-cell');

    numberButtons.forEach((button) => {
      button.style.background = '#adc0c4';
      button.removeAttribute('selected');
    });
  }

  function getSelectedGame() {
    const activeGame = selectGameButtons.find((game) => {
      return game.hasAttribute('active');
    }).id;
    selectedGame = gamesData['types'].find((game) => {
      return game['type'] === activeGame;
    });
  }

  async function addToCart() {
    const selectedNumbers = getElements('[selected]').map((button) => {
      return button.id;
    });

    if (selectedNumbers.length < selectedGame['min-number'])
      return window.alert(
        `You need to mark at least ${selectedGame['min-number']} numbers`
      );

    await fetch('http://localhost:3000/games', {
      mode: 'cors',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game: selectedGame['type'],
        numbers: selectedNumbers,
        price: selectedGame['price'],
        color: selectedGame['color'],
      }),
    });
    loadCartContent();
    clearGame();
  }

  function formatValue(value) {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return formatter.format(value);
  }

  async function loadCartContent() {
    const cartData = await getData('http://localhost:3000/games');
    let cartGamesCompleted;
    [...cartData].length
      ? (cartGamesCompleted = cartData
          .map((element) => {
            return `<div class="game-card"><button class="delete-button" id=${
              element.id
            }><i class="material-icons-outlined">delete</i></button><div class="cart-divisor" style="background: ${
              element['color']
            }" game=${
              element['game']
            }></div><div class="game-infos"><h4 class="cart-numbers">${element[
              'numbers'
            ].join(', ')}</h4><div class="game-name-price"><h4 game=${
              element['game']
            } style="color: ${element['color']}">${
              element['game']
            }</h4><h4 class="game-price">${formatValue(
              element['price']
            )}</h4></div></div></div>`;
          })
          .join(''))
      : (cartGamesCompleted = '');

    cartContent.innerHTML = `<h2>CART</h2> ${cartGamesCompleted}`;

    addEventListenerToDeleteButtons();

    console.log('já adicionou os event');

    const finalValue = await getFinalValue();

    const finalValueElement = document.querySelector('.final-value-container');

    finalValue
      ? (finalValueElement.innerHTML = `<h2>CART</h2>
    <h2 class="total">TOTAL: ${formatValue(finalValue)}</h2>`)
      : (finalValueElement.innerHTML = `<h2>CART</h2>
      <h2 class="total">TOTAL: Empty cart.`);
  }

  function addEventListenerToDeleteButtons() {
    deleteButtons = getElements('.delete-button');

    deleteButtons.forEach((button) => {
      button.addEventListener('click', deleteGame);
    });
  }

  function teste() {
    console.log('ativou teste');
  }

  async function getFinalValue() {
    const cartData = await getData('http://localhost:3000/games');
    if (![...cartData].length) {
      return 0;
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
    await fetch(`http://localhost:3000/games/${event.currentTarget.id}`, {
      method: 'DELETE',
    }).then((response) => response.json);
    await loadCartContent();
  }

  function getRandomNumbers() {
    const numberCells = getElements('.numbers-cell');

    let randomNumbers = [];

    for (let i = 1; i < selectedGame['max-number']; i) {
      const random =
        Math.floor(Math.random() * (selectedGame['range'] - 1)) + 1;
      randomNumbers.push(random);
      randomNumbers = [...new Set(randomNumbers)];
      i = randomNumbers.length;
    }

    const activedButtons = numberCells.filter((element) => {
      return randomNumbers.includes(Number(element.id));
    });

    clearGame();

    activedButtons.forEach((button) => {
      button.style.background = selectedGame['color'];
      button.setAttribute('selected', 'true');
    });
  }

  async function saveCart() {
    const cartValue = await getFinalValue();
    if (cartValue < gamesData['min-cart-value']) {
      return window.alert(
        `The minimum value to make the purchase is ${formatValue(
          gamesData['min-cart-value']
        )}`
      );
    }
  }

  loadSelectButtons();
  loadGameContent();
  loadCartContent();
})();
