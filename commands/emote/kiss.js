const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();
const kissSchema = require('../../model/kiss');


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just kiss at the air ${sedEmoji} please mention somebody pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.reply(`on this day, i vow to be completely yours forever, ${message.author.username}.`)
    if (target.bot) return message.reply("you can't kiss that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id

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
    let data = await sfw.kiss();
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${message.author.username} kissed ${target.username} ❤️ they was kissed ${amount} time${addS}!`, message.author.displayAvatarURL())
        .setImage(data.url)
    return message.channel.send({ embeds: [embed] })
}

exports.help = {
    name: "kiss",
    description: "make her yours man.",
    usage: "kiss `<@mention>`",
    example: "kiss `@Somebody`"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
}