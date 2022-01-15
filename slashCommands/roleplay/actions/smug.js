const { MessageEmbed } = require("discord.js");
const request = require('node-superfetch');

exports.run = async(client, interaction, args) => {
    await interaction.deferReply();
    const { body } = await request.get('https://nekos.best/api/v1/smug');

    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} just smugged 😏`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(body.url)
    return interaction.editReply({ embeds: [embed] })
};