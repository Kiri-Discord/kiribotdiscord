exports.name = 'changeLevelingDestination';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to change destination.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.changeLevelingDestination(message.guildId, message.channelId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};
