const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async(client, message, args) => {
    fetch('https://some-random-api.ml/img/cat')
        .then(res => res.json())
        .then(json => {
            const embed = new Discord.MessageEmbed()
                .setDescription('🐱')
                .setImage(json.link)
            message.channel.send({ embeds: [embed] })
        })
        .catch(err => console.error(err))

};


exports.help = {
    name: "cat",
    description: "get a random cat image 🐱",
    usage: "cat",
    example: "cat"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
};