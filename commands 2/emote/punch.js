const { MessageEmbed } = require("discord.js");
const punchSchema = require('../../model/punch');
const fetch = require('node-fetch');


exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
        return message.reply(`you can't just punch at the air ${sedEmoji} please mention somebody to punch pls`)
    };

    const target = member.user;

    if (target.id === client.user.id) return message.reply('you truly are the lowest scum in history.')
    if (target.bot) return message.reply("you can't punch that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === message.author.id) {
        message.reply('are you in pain?')
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
        .setColor("RANDOM")
        .setAuthor(`${message.author.username} punch ${target.username} 😔 they was punched ${amount} time${addS}!`, message.author.displayAvatarURL())

    await fetch('https://neko-love.xyz/api/v1/punch')
        .then(res => res.json())
        .then(json => embed.setImage(json.url))
        .catch(err => {
            message.channel.send(`an error happened on my side and you wasn't able to punch that person ${stare} here is a hug for now 🤗`);
            return console.error(err);
        });

    return message.channel.send(embed)
}
exports.help = {
    name: "punch",
    description: "feeling triggered? do this.\ni won't judge you tho 😏",
    usage: "punch `<@mention>`",
    example: "punch `@Dyno`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}