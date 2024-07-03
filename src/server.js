const http = require('http');
const io = require('./sockethandler');
const app = require('./app');
const GameManager = require('./services/GameManager');

const server = http.createServer(app.app);
const gameManager = new GameManager();
app._setGameManager(gameManager);
io(server,gameManager);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});