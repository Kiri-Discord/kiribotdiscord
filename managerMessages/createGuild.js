exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to create new data.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.createGuild(message.guildId, message.save);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};

exports.name = 'createGuild';