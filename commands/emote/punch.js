const { MessageEmbed } = require("discord.js");
const punchSchema = require('../../model/punch');
const request = require('node-superfetch');


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    if (!member) {
        return message.reply(`you can't just punch at the air! please mention somebody to punch pls ${sedEmoji}`);
    };

    const target = member.user;

    if (target.id === client.user.id) return message.reply('you truly are the lowest scum in history.');
    if (target.bot) return message.reply("you can't punch that bot, sorry :(");

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id

    if (targetId === message.author.id) {
        message.channel.send(`${message.author.toString()}, are you in pain?`);
        return
    };

    const result = await punchSchema.findOneAndUpdate({
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
    const { body } = await request.get('https://neko-love.xyz/api/v1/punch');
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} punch ${target.username} 😔 they was punched ${amount} time${addS}!`, message.author.displayAvatarURL())
        .setImage(body.url)

    return message.channel.send({ embeds: [embed] })
}
exports.help = {
    name: "punch",
    description: "punch somebody in the face",
    usage: ["punch `<@mention>`"],
    example: ["punch `@Bell`"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}