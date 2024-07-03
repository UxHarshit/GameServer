class User {
    constructor(id, name, roomId,socket) {
        this.id = id;
        this.name = name;
        this.roomId = roomId;
        this.messages = [];
        this.isAlive = true;
        this.warnCount = 0;
        this.socket = socket;
    }

    getSocket() {
        return this.socket;
    }

    addMessage(message) {
        this.messages.push(message);
    }

    setWarnCount(count) {
        this.warnCount = count;
    }
    getWarnCount() {
        return this.warnCount;
    }

    setAliveStatus(status) {
        this.isAlive = status;
    }
}

module.exports = User;
