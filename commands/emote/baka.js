const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const { body } = await request.get('https://nekos.best/api/v1/:baka');
    const data = body.url;
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setAuthor(`${message.author.username} said baka 😕`, message.author.displayAvatarURL())
        .setImage(data)
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