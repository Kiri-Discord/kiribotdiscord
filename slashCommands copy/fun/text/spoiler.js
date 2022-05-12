const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, interaction) => {
    let query = interaction.options.getString('text');
    await interaction.deferReply();
    let text = await sfw.spoiler({ text: query });
    return interaction.editReply(text.owo);
};