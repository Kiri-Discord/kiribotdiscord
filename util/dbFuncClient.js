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
    async createGuild(id, save) {
        if (!id) throw new Error('Guild ID is required to create data.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'createGuild', guildId: id, save });
        if (!value) return null;
        else return value;
    }
    async purgeGuild(id) {
        if (!id) throw new Error('Guild ID is required to delete data.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'purgeGuild', guildId: id });
        if (!value) return null;
        else return value;
    }
    async purgeMember(guildId, userId) {
        if (!guildId) throw new Error('Guild ID is required to delete data.', __dirname);
        if (!userId) throw new Error('User ID is required to delete data.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'purgeMember', guildId, userId });
        if (!value) return null;
        else return value;
    }
    async fetchEmbeds(guildId) {
        if (!guildId) throw new Error('Guild ID is required to fetch embed.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'fetchEmbeds', guildId });
        if (!value) return null;
        else return value;
    }
    async saveEmbed(guildId, embed, id, creatorId) {
        if (!guildId) throw new Error('Guild ID is required to create embed.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'saveEmbed', guildId, embed, id, creatorId });
        if (!value) return null;
        else return value;
    }
    async deleteEmbed(guildId, id) {
        if (!guildId) throw new Error('Guild ID is required to create embed.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'deleteEmbed', guildId, id });
        if (!value) return null;
        else return value;
    }
};