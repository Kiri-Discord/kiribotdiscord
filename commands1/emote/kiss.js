const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const kissSchema = require('../../model/kiss');

exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    if (!member) {
        return message.reply(`you can't just kiss at the air ${sedEmoji} please mention somebody pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.reply(`on this day, i vow to be completely yours forever, ${message.author.username}.`)
    if (target.bot) return message.reply("you can't kiss that bot, sorry :(")

    const { guild } = message;
    const guildId = guild.id;
    const targetId = target.id;
    const authorId = message.author.id;

    if (targetId === authorId) {
        return message.reply(`is the world too harsh for you? ${sedEmoji}`);
    };

    const result = await kissSchema.findOneAndUpdate({
        userId: targetId,
        guildId,
    }, {
        userId: targetId,
        guildId,
        $inc: {
            received: 1,
        },
    }, {
        upsert: true,
        new: true,
    });
    const { body } = await request.get('https://nekos.best/api/v1/kiss');
    let data = body.url;
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${message.author.username} kissed ${target.username} ❤️ they was kissed ${amount} time${addS}!`, iconURL: message.author.displayAvatarURL()})
        .setImage(data)
    return message.channel.send({ embeds: [embed] })
};

exports.help = {
    name: "kiss",
    description: "make her yours man.",
    usage: ["kiss `<@mention>`"],
    example: ["kiss `@someone`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}