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
        if (!embed) throw new Error('Embed is required to create embed.', __dirname);
        if (!id) throw new Error('Embed ID is required to create embed.', __dirname);
        if (!creatorId) throw new Error('Creator ID is required to create embed.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'saveEmbed', guildId, embed, id, creatorId });
        if (!value) return null;
        else return value;
    }
    async deleteEmbed(guildId, id) {
        if (!guildId) throw new Error('Guild ID is required to delete embed.', __dirname);
        if (!id) throw new Error('Embed ID is required to delete embed.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'deleteEmbed', guildId, id });
        if (!value) return null;
        else return value;
    }
    async changeLevelingContent(guildId, content) {
        if (!guildId || !content) throw new Error('Both content and guild ID is required to change or create content', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeLevelingContent', guildId, content });
        if (!value) return null;
        else return value;
    }
    async changeByeContent(guildId, content) {
        if (!guildId) throw new Error('Guild ID is required to change or create content', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeByeContent', guildId, content });
        if (!value) return null;
        else return value;
    }
    async changeByeDestination(guildId, destination) {
        if (!guildId) throw new Error('Both destination and guild ID is required to change or create destination', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeByeDestination', guildId, channelId: destination });
        if (!value) return null;
        else return value;
    }
    async changeHiDestination(guildId, destination) {
        if (!guildId) throw new Error('Both destination and guild ID is required to change or create destination', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeHiDestination', guildId, channelId: destination });
        if (!value) return null;
        else return value;
    }
    async changeHiContent(guildId, content) {
        if (!guildId) throw new Error('Guild ID is required to change or create content', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeHiContent', guildId, content });
        if (!value) return null;
        else return value;
    }
    async changeLevelingDestination(guildId, destination) {
        if (!guildId) throw new Error('Both destination and guild ID is required to change or create destination', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeLevelingDestination', guildId, channelId: destination });
        if (!value) return null;
        else return value;
    }
    async changeModLog(guildId, channelId) {
        if (!guildId) throw new Error('Guild ID is required to modify mod log channel.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changeModLog', guildId, channelId });
        if (!value) return null;
        else return value;
    }
    async changePrefix(guildId, prefix) {
        if (!guildId || !prefix) throw new Error('Both Guild ID and prefix is required to set a new prefix.', __dirname);
        const { value } = await this.client.cluster.request({ type: 'changePrefix', guildId, prefix });
        if (!value) return null;
        else return value;
    }
};