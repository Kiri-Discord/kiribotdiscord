const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const hugSchema = require('../../model/hug');


exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    if (!member) {
        return message.channel.send(`you can't just hug at the air ${sedEmoji} please mention somebody to hug pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.channel.send(`**${message.author.username}**, do you need a hug? :hugging:`)
    if (target.bot) return message.reply("you can't hug that bot, sorry :(")

    const { guild } = message;
    const guildId = guild.id;
    const targetId = target.id;
    const authorId = message.author.id;

    if (targetId === authorId) {
        message.reply('you hug yourself :( here, take my hug instead 🤗')
        return
    };

    const result = await hugSchema.findOneAndUpdate({
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
    const { body } = await request.get('https://nekos.best/api/v1/hug');
    let data = body.url;
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${message.author.username} hugged ${target.username} ❤️ they was hugged ${amount} time${addS}!`, iconURL: message.author.displayAvatarURL()})
        .setImage(data)
    return message.channel.send({ embeds: [embed] })
}

exports.help = {
    name: "hug",
    description: "hug somebody with care",
    usage: ["hug <@mention>"],
    example: ["hug @somebody"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};