const req = require('node-superfetch');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    try {
        const { body } = await req.get('http://api.adviceslip.com/advice');
        return interaction.editReply(JSON.parse(body.toString()).slip.advice.toLowerCase());
    } catch (e) {
        logger.log('error', e);
        return interaction.editReply(`i can't seem to be able to give you an advice :pensive: here is a hug for now instead 🤗`);
    };
};