exports.name = 'changeHiDestination';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId || !message.content) throw new Error('Guild ID and content are required to change content.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.changeHiDestination(message.guildId, message.channelId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};
