const { MessageEmbed } = require("discord.js")
const fetch = require('node-fetch');

exports.run = async(client, interaction, args) => {
    await interaction.deferReply();
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setAuthor({name: `${interaction.user.username} cried :(`, iconURL: interaction.user.displayAvatarURL()})

    fetch('https://nekos.best/api/v1/cry')
        .then(res => res.json())
        .then(json => embed.setImage(json.url))
        .then(() => interaction.editReply({ embeds: [embed] }))
        .catch(err => {
            interaction.editReply("i can't seem to be able to do that :( here is a hug for now 🤗");
            return logger.log('error', err);
        });

};