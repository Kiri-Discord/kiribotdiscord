const { MessageEmbed } = require("discord.js");
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const { body } = await request.get('https://nekos.best/api/v1/smug');

    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} just smugged 😏`, message.author.displayAvatarURL())
        .setImage(body.url)
    return message.channel.send({ embeds: [embed] })
};

exports.help = {
    name: "smug",
    description: "smug on somebody 🤔",
    usage: ["smug"],
    example: ["smug"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,
    clientPerms: ["EMBED_LINKS"]
}
