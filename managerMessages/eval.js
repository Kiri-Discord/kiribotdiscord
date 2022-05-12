exports.run = async (cluster, message) => {
    try {
        if (!message.eval) return message.reply({ value: 'No value to eval' });
        const evaled = await eval(message.eval);
        if (!evaled) return message.reply({ value: null });
        else return message.reply({ value: evaled });
    } catch (error) {
        logger.error(error);
        return message.reply({ error: error });
    }
};


exports.name = 'eval';