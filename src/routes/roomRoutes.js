const express = require('express');
const roomRouter = express.Router();

var gameManager = null;

roomRouter.get('/rooms', (req, res) => {
    res.send(gameManager.getRoomsData());
});

module.exports = {roomRouter, setGameManager: (gm) => {gameManager = gm}};