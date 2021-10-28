const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    fetch('https://some-random-api.ml/img/cat')
        .then(res => res.json())
        .then(json => {
            const embed = new MessageEmbed()
                .setDescription('🐱')
                .setImage(json.link)
            interaction.editReply({ embeds: [embed] });
        })
        .catch(err => logger.log('error', err))

};