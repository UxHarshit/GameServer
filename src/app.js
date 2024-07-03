const express = require('express');
const {roomRouter ,setGameManager} = require('./routes/roomRoutes');
const app = express();

app.use(express.static('public'));

function _setGameManager(gameManager) {
    setGameManager(gameManager);
}


app.get('/rooms',roomRouter);




module.exports = {app,_setGameManager};