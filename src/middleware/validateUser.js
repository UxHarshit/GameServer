const logger = require("../config/logger");

function validateUserName(socket, next, gameManager) {
    const { name, roomId } = socket.handshake.query;
    if (!name || name.trim() === '') {
        return next(new Error('Name is required'));
    }
    if (!roomId || roomId.trim() === '') {
        return next(new Error('Room ID is required'));
    }
    if (gameManager.isRoomEmpty()) {
        next();
    } else {
        if(gameManager.isBanned(roomId, name)) return next(new Error('You are banned from this room'));

        if (!gameManager.roomExists(roomId)) {
            next();
        } else if (gameManager.checkName(roomId, name)) {
            return next(new Error('Name already taken'));
        } else {
            next();
        }

    }
}

module.exports = validateUserName;