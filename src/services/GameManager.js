const logger = require('../config/logger');
const User = require('../models/User');
const words = require('../config/blackWords')

class GameManager {
    constructor() {
        this.rooms = {};
        this.fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Lemon', 'Orange', 'Pear', 'Strawberry', 'Watermelon'];
        this.blacklistedWords = new Set(words)
    }

    containsBlacklistedWord(message){
        const words = message.toLowerCase().split(/\+s/)
        for(const word of words){
            if(this.blacklistedWords.has(word)){
                return true;
            }
        }
        return false;
    }

    checkPlayers(roomId) {
        return this.rooms[roomId].players === undefined ? false : true;
    }

    checkName(roomId, name) {
        return this.rooms[roomId].players.find(player => player.name === name) ? true : false;
    }

    isBanned(roomId, name) {
        return this.rooms[roomId].banned.includes(name);
    }

    getRoomsData() {
        return Object.values(this.rooms).map(room => {
            return {
                roomId: room.roomId,
                host: room.host,
                players: room.players.map(player => { return { name: player.name, messages: player.messages }}),
                banned : room.banned,
                turnIndex: room.turnIndex,
            };
        });
    }

    isRoomEmpty() {
        return Object.keys(this.rooms).length === 0;
    }

    roomExists(roomId) {
        return this.rooms[roomId] ? true : false;
    }

    createRoom(roomId, name) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                host: name,
                roomId: roomId,
                players: [],
                banned: [],
                timer: null,
                turnIndex: 0,
            };
            logger(`Room ${roomId} created`);
            return this.rooms[roomId];
        } else return null;
    }

    joinRoom(roomId, socket, playerName) {
        this.createRoom(roomId, playerName);
        const user = new User(socket.id, playerName, roomId, socket);
        this.rooms[roomId].players.push(user);
        socket.join(roomId);
        logger(`User ${playerName} joined room ${roomId}`);
        socket.emit('message', `Welcome to room ${roomId}`);
        socket.to(roomId).emit('message', `${playerName} joined the room`);
    }

    leaveRoom(socket) {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            const playerIndex = room.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                const name = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);

                if (Object.keys(room.players).length === 0) {
                    delete this.rooms[roomId];
                    logger(`Room ${roomId} deleted`);
                } else {
                    logger(`User ${name} left room ${roomId}`);
                    socket.to(roomId).emit('message', `${name} left the room`);
                }
            }
        }
    }

    sendMessage(data, socket) {
        const { roomId, message } = data;
        const room = this.rooms[roomId];
        if (room) {
            const user = room.players.find(player => player.id === socket.id);
            if (user) {
                if(this.containsBlacklistedWord(message)){
                    if(user.getWarnCount() >= 2){
                        socket.disconnect();
                        room.banned.push(user.name);
                        this.sendSystem(roomId,'You have been banned from the room', socket);
                        return;
                    }
                    
                    user.setWarnCount(user.getWarnCount() + 1);
                    logger(`Message from ${user.name} in room ${roomId}: ${message}`);
                    this.sendSystem(roomId,'You used a blacklisted word, your message was not sent further attempt will result in a ban', socket);
                    return;
                }
                
                user.addMessage(message);
                logger(`Message from ${user.name} in room ${roomId}: ${message}`);
                socket.emit('message', `You: ${message}`);
                socket.to(roomId).emit('message', `${user.name}: ${message}`);
            }
        }
    }
    sendSystem(id,message, socket) {
        const room = this.rooms[id];
        if (room) {
            logger(`System message in room ${id}: ${message}`);
            socket.emit('message', `System: ${message}`);
        }
    }
}

module.exports = GameManager;
