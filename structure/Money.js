module.exports = class Money {
    constructor(client, userId, guildId) {
        this.client = client;
        this.userId = userId;
        this.guildId = guildId;
    }
    async fetch() {
    }
};