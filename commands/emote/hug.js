const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();
const hugSchema = require('../../model/hug')


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just hug at the air ${sedEmoji} please mention somebody to hug pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.reply('you need a hug? :hugging:')
    if (target.bot) return message.reply("you can't hug that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

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
    let data = await sfw.hug();
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${message.author.username} hugged ${target.username} ❤️ they was hugged ${amount} time${addS}!`, message.author.displayAvatarURL())
        .setImage(data.url)
    return message.channel.send({ embeds: [embed] })
}

exports.help = {
    name: "hug",
    description: "why are you still seeing this page? just do it lmao",
    usage: "hug <@mention>",
    example: "hug @Somebody"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
}