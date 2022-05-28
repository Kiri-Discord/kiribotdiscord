exports.name = 'saveEmbed';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to save embeds.', __dirname);
        if (!message.embed) throw new Error('Embed is required to save embeds.', __dirname);
        if (!message.id) throw new Error('An ID is required to save embeds.', __dirname);
        if (!message.creatorId) throw new Error('Creator ID is required to save embeds.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.saveEmbed(message.guildId, message.embed, message.id, message.creatorId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};