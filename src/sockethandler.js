const socketIo = require('socket.io');
const log = require('./config/logger');
const validateUser = require('./middleware/validateUser');
var io = null;

const _io = (server,gameManager) => {
    if(!io) {
        const io = socketIo(server);
        // set ping timeout to 10 seconds
        io.engine.pingTimeout = 10000;
        io.use((socket, next) => {
            validateUser(socket, next, gameManager);
        });
        io.on('connection', (socket) => {
            const {roomId, name} = socket.handshake.query;
            gameManager.joinRoom(roomId, socket, name);

            socket.on('getRoomsData', () => {
                gameManager.getRoomsData(socket,roomId);
            });

            socket.on('chatMessage', (message) => {
                if(message.trim() === '') return;
                const data = {roomId,message}
                gameManager.sendMessage(data, socket);
            });

            socket.on('disconnect', () => {
                gameManager.leaveRoom(socket);
            });
        });
    } else {
        return io;
    }
}





module.exports = _io;
