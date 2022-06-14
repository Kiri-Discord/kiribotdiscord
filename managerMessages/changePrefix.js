exports.name = 'changePrefix';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId || !message.prefix) throw new Error('Both Guild ID and prefix is required to set a new prefix.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.changePrefix(message.guildId, message.prefix);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};
