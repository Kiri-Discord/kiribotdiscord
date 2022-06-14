exports.name = 'changeModLog';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to modify mod log channel.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.changeModLog(message.guildId, message.channelId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};
