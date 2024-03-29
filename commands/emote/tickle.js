const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:'
    if (!member) {
        return message.reply(`you can't just hug at the air ${sedEmoji} please mention somebody to hug pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.reply("you don't know how bad it will be, do you?")
    if (target.bot) return message.reply("you can't tickle that bot, sorry :(")
    const targetId = target.id
    const authorId = message.author.id

    if (targetId === authorId) {
        message.reply(`have you lost your mind ${deadEmoji}`)
        return
    };
    const { body } = await request.get('https://nekos.best/api/v1/tickle');
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${message.author.username} tickled ${target.username}!`, iconURL: message.author.displayAvatarURL()})
        .setImage(body.url)
    return message.channel.send({ embeds: [embed] })
};

exports.help = {
    name: "tickle",
    description: "tickle somebody to death",
    usage: ["tickle `<@mention>`"],
    example: ["tickle `@someone`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};