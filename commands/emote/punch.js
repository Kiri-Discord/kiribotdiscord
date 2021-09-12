const { MessageEmbed } = require("discord.js");
const punchSchema = require('../../model/punch');
const fetch = require('node-fetch');


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just punch at the air! please mention somebody to punch pls ${sedEmoji}`);
    };

    const target = member.user;

    if (target.id === client.user.id) return message.reply('you truly are the lowest scum in history.');
    if (target.bot) return message.reply("you can't punch that bot, sorry :(");

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id

    if (targetId === message.author.id) {
        message.reply('are you in pain?');
        return
    };
    const stare = client.customEmojis.get('staring') ? client.customEmojis.get('staring') : ':thinking:';

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
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${message.author.username} punch ${target.username} 😔 they was punched ${amount} time${addS}!`, message.author.displayAvatarURL())

    await fetch('https://neko-love.xyz/api/v1/punch')
        .then(res => res.json())
        .then(json => embed.setImage(json.url))
        .catch(err => {
            message.channel.send(`an error happened on my side and you wasn't able to punch that person ${stare} here is a hug for now 🤗`);
            return console.error(err);
        });

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