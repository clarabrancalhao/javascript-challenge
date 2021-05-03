const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const games = [];

app.get('/games', function (req, res) {
  return res.json(games);
});

app.post('/games', function (req, res) {
  const game = req.body;
  const newGame = { ...game, id: uuid() };
  games.push(newGame);
  return res.json(newGame);
});

app.delete('/games/:deletedID', function (req, res) {
  const { deletedID } = req.params;
  const gameIndex = games.findIndex((game) => game.id === deletedID);
  games.splice(gameIndex, 1);
  return res.sendStatus(204);
});

app.listen(port);
