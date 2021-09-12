const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    const data = await sfw.baka();
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setAuthor(`${message.author.username} just tell someone stupid 😕`, message.author.displayAvatarURL())
        .setImage(data.url)
    return message.channel.send({ embeds: [embed] });

}
exports.help = {
    name: "baka",
    description: "give a stupid presence to everyone :confused:",
    usage: ["baka"],
    example: ["baka"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};