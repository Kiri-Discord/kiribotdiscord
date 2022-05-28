exports.name = 'fetchEmbeds';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to fetch embeds.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.fetchEmbeds(message.guildId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};