const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);
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
    const data = await sfw.tickle();
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} tickled ${target.username}!`, message.author.displayAvatarURL())
        .setImage(data.url)
    return message.channel.send({ embeds: [embed] })
}

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