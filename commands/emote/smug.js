const { MessageEmbed } = require("discord.js");
const neko = require('nekos.life');
const { sfw } = new neko();


exports.run = async(client, message, args) => {
    let data = await sfw.smug();

    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} just smugged 😏`, message.author.displayAvatarURL())
        .setImage(data.url)
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