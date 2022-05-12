exports.name = 'purgeMember';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID is required to delete data.', __dirname);
        if (!message.userId) throw new Error('User ID is required to delete data.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.purgeMember(message.guildId, message.userId);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};