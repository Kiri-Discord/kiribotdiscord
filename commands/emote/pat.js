const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();
const patSchema = require('../../model/pat');


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just pat at the air ${sedEmoji} please mention somebody to pat pls`)
    };

    const target = member.user;

    if (target.id === client.user.id) return message.reply('**pat pat pat pat pat**\nyes, you!')
    if (target.bot) return message.reply("this isn't an simulator so you can't pat that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id;

    if (targetId === authorId) {
        message.reply('**pat pat pat pat pat**\nyes, you!')
        return
    }

    const result = await patSchema.findOneAndUpdate({
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
    let data = await sfw.pat();
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${message.author.username} pat ${target.username} ❤️ they was pat ${amount} time${addS}!`, message.author.displayAvatarURL())
        .setImage(data.url)

    return message.channel.send({ embeds: [embed] });
}

exports.help = {
    name: "pat",
    description: "this is super duper self-explanatory",
    usage: "pat `<@mention>`",
    example: "pat `@somebody`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
};