const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const slapSchema = require('../../model/slap')


exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just slap at the air ${sedEmoji} please mention somebody to slap pls`)
    };

    const target = member.user;

    if (target.id === client.user.id) return message.reply('what did you say?');
    if (target.bot) return message.reply("you can't slap that bot, sorry :(")

    const { guild } = message;
    const guildId = guild.id;
    const targetId = target.id;

    if (targetId === message.author.id) return message.channel.send(`${message.author.toString()}, are you in pain?`);

    const result = await slapSchema.findOneAndUpdate({
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
    })

    const amount = result.received;

    const { body } = await request.get('https://nekos.best/api/v1/slap');
    let image = body.url;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} slap ${target.username} 😔 they was slapped ${amount} time${addS}!`, message.author.displayAvatarURL())
        .setImage(image)

    return message.channel.send({ embeds: [embed] })
}
exports.help = {
    name: "slap",
    description: "slap someone with your best",
    usage: ["slap `<@mention>`"],
    example: ["slap `@bell`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}