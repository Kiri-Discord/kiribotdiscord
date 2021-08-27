const canvacord = require('canvacord');
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    let rank;

    let mention = await getMemberfromMention(args[0], message.guild) || message.member;

    if (mention.user.id === client.user.id) return message.inlineReply('that was me lmao :confused:');
    if (mention.user.bot) return message.inlineReply('just to make this clear... bots can\'t level up :pensive:')

    let target = await client.dbleveling.findOne({
        guildId: message.guild.id,
        userId: mention.user.id
    });

    if (!target) return message.channel.send("you or that user doesn't have any leveling data yet. chat more to show yours :)");

    const res = client.leveling.getLevelBounds(target.level + 1)

    let neededXP = res.lowerBound

    const result = await client.dbleveling.find({
        guildId: message.guild.id,
    }).sort({
        xp: -1
    });

    if (!result) return message.inlineReply("this guild doesn't have any leveling data yet. chat more to show yours :)");

    for (let counter = 0; counter < result.length; ++counter) {
        let member = message.guild.members.cache.get(result[counter].userId)
        if (!member) {
            client.dbleveling.findOneAndDelete({
                userId: result[counter].userId,
                guildId: message.guild.id,
            }, (err) => {
                if (err) console.error(err)
            });
        } else if (member.user.id === mention.user.id) {
            rank = counter + 1
        }
    }
    message.channel.startTyping(true);

    const rankboard = new canvacord.Rank()
        .renderEmojis(true)
        .setAvatar(mention.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' }))
        .setCurrentXP(target.xp)
        .setRequiredXP(neededXP)
        .setStatus(mention.user.presence.status)
        .setLevel(target.level)
        .setRank(rank)
        .setDiscriminator(mention.user.discriminator)
        .setUsername(mention.user.username)
        .setProgressBar("#e6e6ff", "COLOR")
        .setBackground("IMAGE", 'https://i.ibb.co/yV1PRjr/shinjuku-tokyo-mimimal-4k-o8.jpg')

    rankboard.build().then(data => {
        message.channel.stopTyping(true);
        message.channel.send(`*behold, the rank card for* **${mention.user.username}**!`, { files: [{ attachment: data, name: "rank.png" }] })
    })
}

exports.help = {
    name: "levelrank",
    description: "show the current leveling rank of an user or yourself",
    usage: ["levelrank `[@member]`", "levelrank `[user ID]`"],
    example: ["levelrank `@bell`", "levelrank `661172574754545`"]
};

exports.conf = {
    aliases: ["rank", "level"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};