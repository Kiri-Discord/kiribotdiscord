exports.name = 'deleteEmbed';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to save embeds.', __dirname);
        if (!message.id) throw new Error('An ID is required to save embeds.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.deleteEmbed(message.guildId, message.id);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};