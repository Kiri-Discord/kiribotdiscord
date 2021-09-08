const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();
const slapSchema = require('../../model/slap')


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just slap at the air ${sedEmoji} please mention somebody to slap pls`)
    };

    const target = member.user;

    if (target.id === client.user.id) return message.reply('what did you say?');
    if (target.bot) return message.reply("you can't slap that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id

    if (targetId === message.author.id) {
        message.reply('are you in pain?')
        return
    }
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

    const data = await sfw.slap();
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${message.author.username} slap ${target.username} 😔 they was slapped ${amount} time${addS}!`, message.author.displayAvatarURL())
        .setImage(data.url)

    message.channel.send(embed)
}
exports.help = {
    name: "slap",
    description: "slap someone with your best",
    usage: "slap `<@mention>`",
    example: "slap `@bell`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}