const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:'
    if (!member) {
        return message.reply(`you can't just feed at the air ${sedEmoji} please mention somebody to feed pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.reply("thanks, but i'm full already, sorry :pensive:")
    if (target.bot) return message.reply("you can't feed that bot, sorry :(")
    const targetId = target.id
    const authorId = message.author.id

    if (targetId === authorId) return message.channel.send(`have you lost your mind ${deadEmoji}`);
    const { body } = await request.get('https://nekos.best/api/v1/feed');
    let data = body.url;
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} fed ${target.username}!`, message.author.displayAvatarURL())
        .setImage(data)
    return message.channel.send({ embeds: [embed] })
}

exports.help = {
    name: "feed",
    description: "feed someone full ❤️",
    usage: ["feed <@mention>"],
    example: ["feed @somebody"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}