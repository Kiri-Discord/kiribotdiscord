module.exports = class dbFuncClient {
    constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
	};
    async existingGuild(id) {
        if (!id) throw new Error('Guild ID is required to check existing data.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'existingGuild', guildId: id });
        if (!value) return null;
        else return value;
    };
    async createGuild(id) {
        if (!id) throw new Error('Guild ID is required to create data.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'createGuild', guildId: id });
        if (!value) return null;
        else return value;
    }
    async purgeGuild(id) {
        if (!id) throw new Error('Guild ID is required to delete data.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'purgeGuild', guildId: id });
        if (!value) return null;
        else return value;
    }
};