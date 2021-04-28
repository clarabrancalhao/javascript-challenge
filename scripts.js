(async () => {
  const getData = async function (json) {
    const response = await fetch(json);
    const results = await response.json();
    return results;
  };
  const data = await getData('./server/games.json');

  const description = document.querySelector('.description-container');
  const gameName = document.querySelector('.game-name-container');
  const selectGameButtons = [...document.querySelectorAll('.select-game')];
  const numbersSection = document.querySelector('.numbers-section');

  console.log(numbersSection);

  function loadGameContent() {
    let activetedButton = selectGameButtons.find((element) => {
      return element.hasAttribute('active');
    }).id;
    gameName.innerHTML = `<h2>NEW BET</h2>
    <h2 class="game-name">FOR ${activetedButton.toUpperCase()}</h2>`;
    description.innerHTML = `<h4>Fill your bet</h4>
    <h4 class="game-description">${
      data['types'].find((element) => {
        return element['type'] == activetedButton;
      })['description']
    }</h4>`;

    range = data['types'].find((element) => {
      return element['type'] == activetedButton;
    })['range'];

    displayNumbers(range);
  }

  selectGameButtons.forEach((button) => {
    button.addEventListener('click', selectedGame);
  });

  async function selectedGame(event) {
    selectGameButtons.forEach((button) => {
      button.removeAttribute('active', 'false');
    });
    event.target.setAttribute('active', 'true');
    loadGameContent();
  }

  function displayNumbers(range) {
    let numbersCells = '';
    for (let i = 1; i <= range; i++) {
      numbersCells += `<button class="numbers-cell">${i}</button>`;
    }
    numbersSection.innerHTML = numbersCells;
  }

  loadGameContent();
})();
