const { MessageEmbed } = require('discord.js');
const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const gooseEmoji = client.customEmojis.get('goose') ? client.customEmojis.get('goose') : ':duck:';
    const data = await sfw.goose();
    const embed = new MessageEmbed()
        .setDescription(`${gooseEmoji}`)
        .setImage(data.url)
    return interaction.editReply({ embeds: [embed] })
};