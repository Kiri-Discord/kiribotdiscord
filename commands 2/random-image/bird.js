const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async(client, message, args) => {
    fetch('https://some-random-api.ml/img/birb')
        .then(res => res.json())
        .then(json => {
            const embed = new Discord.MessageEmbed()
                .setDescription('🐦')
                .setImage(json.link)
            message.channel.send({ embeds: [embed] })
        })
        .catch(err => console.error(err))

};


exports.help = {
    name: "bird",
    description: "Get a random bird image",
    usage: "bird",
    example: "bird"
};

exports.conf = {
    aliases: [],
    cooldown: 3,

    channelPerms: ["EMBED_LINKS"]
};