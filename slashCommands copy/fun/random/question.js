const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    try {
        let text = await sfw.why();
        return interaction.editReply(text.why.toLowerCase())
    } catch (error) {
        return interaction.editReply('hmm, something happened when i was trying to get you a random question :pensive:')
    };
};