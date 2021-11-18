const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:'
    if (!member) {
        return message.reply(`you can't just poke at the air ${sedEmoji} please mention somebody to poke pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.reply("you don't know how bad it would be, do you?")
    if (target.bot) return message.reply("you can't poke that bot, sorry :(")
    const targetId = target.id
    const authorId = message.author.id

    if (targetId === authorId) {
        message.reply(`have you lost your mind ${deadEmoji}`);
        return
    };
    const { body } = await request.get('https://nekos.best/api/v1/poke');
    let image = body.url;
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} poke at ${target.username}!`, message.author.displayAvatarURL())
        .setImage(image)
    return message.channel.send({ embeds: [embed] })
}

exports.help = {
    name: "poke",
    description: "poke somebody",
    usage: ["poke <@mention>"],
    example: ["poke @someone"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};