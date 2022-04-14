exports.run = async (cluster, message) => {
    
    try {
        if (!message.guildId) throw new Error('Guild ID is required to check existing data.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.existingGuild(message.guildId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};

exports.name = 'existingGuild';