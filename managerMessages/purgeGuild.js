exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to delete data.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.purgeGuild(message.guildId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};


exports.name = 'purgeGuild';