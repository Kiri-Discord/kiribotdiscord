exports.name = 'changeHiContent';

exports.run = async (cluster, message) => {
    try {
        if (!message.guildId) throw new Error('Guild ID are required to change content.', __dirname);
        const data = await cluster.manager.passthrough.dbFuncs.changeHiContent(message.guildId, message.content);
        if (!data) return message.reply({ value: null });
        else return message.reply({ value: data });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: true });
    }
};
