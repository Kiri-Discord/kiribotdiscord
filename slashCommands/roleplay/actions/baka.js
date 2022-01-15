const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const { body } = await request.get('https://nekos.best/api/v1/baka');
    const data = body.url;
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setAuthor({name: `${interaction.user.username} said baka 😕`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(data)
    return interaction.editReply({ embeds: [embed] });

};