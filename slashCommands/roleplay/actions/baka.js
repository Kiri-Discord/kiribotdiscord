const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, interaction, args) => {
    await interaction.deferReply();
    const { body } = await request.get('https://nekos.best/api/v1/baka');
    const data = body.url;
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setAuthor(`${interaction.user.username} said baka 😕`, interaction.user.displayAvatarURL())
        .setImage(data)
    return interaction.editReply({ embeds: [embed] });

};