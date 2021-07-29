const Pagination = require('discord-paginationembed');
const { millify } = require('millify');
const ordinal = require('ordinal');

exports.run = async(client, message, args, prefix) => {
    let data = await client.money.find({
        guildId: message.guild.id,
    }).sort({
        balance: -1
    });
    if (!data || !data.length) return message.channel.send({ embed: { color: "f3f3f3", description: `❌ i can't find any money data for this guild :pensive: use \`${prefix}help currency\` for more info :smile:` } });

    const emoji = {
        "1": ":crown:",
        "2": ":trident:",
        "3": ":trophy:",
        "4": ":medal:",
        "5": ":zap:"
    };
    let arr = [];
    let rank = message.guild.memberCount;
    data.map((user, index) => {
        let member = message.guild.members.cache.get(user.userId);
        if (!member) {
            client.money.findOneAndDelete({
                userId: user.userId,
                guildId: message.guild.id,
            }, (err) => {
                if (err) console.error(err)
            });
            arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| —  ⏣ **${millify(user.balance)}**`);
        } else {
            if (member.user.id === message.author.id) rank = index + 1;
            arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** — ⏣ **${millify(user.balance)}**`);
        }
    });
    // for (let counter = 0; counter < data.length; ++counter) {

    //     let member = message.guild.members.cache.get(data[counter].userId)

    //     if (!member) {
    //         client.dbleveling.findOneAndDelete({
    //             userId: data[counter].userId,
    //             guildId: message.guild.id,
    //         }, (err) => {
    //             if (err) console.error(err)
    //         });

    //     } else if (member.user.id === message.author.id) {
    //         rank = counter + 1
    //     }
    // };

    const FieldsEmbed = new Pagination.FieldsEmbed()
        .setArray(arr)
        .setElementsPerPage(10)
        .setPageIndicator(true, (page, pages) => `page ${page} of ${pages}`)
        .setAuthorizedUsers([message.author.id])
        .formatField('\u200b', list => list)
        .setChannel(message.channel)
        .setClientAssets({ prompt: 'uh {{user}} to what page would you like to jump? type 0 or \'cancel\' to cancel jumping.' })
        .setTimeout(25000)

    FieldsEmbed.embed
        .setColor(message.guild.me.displayHexColor)
        .setAuthor(`richest user in ${message.guild.name}:`, message.author.displayAvatarURL())
        .setFooter(`you are ranked ${ordinal(rank)} in this guild :)`)
        .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
        .setDescription(`token (⏣) can be claimed by winning games, betting and economy related features. (\`${prefix}help currency\`)`)
    FieldsEmbed.build();
}

exports.help = {
    name: "richest",
    description: "show the leaderboard of people that have the most token in this server 💰",
    usage: "richest",
    example: "richest"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["MANAGE_MESSAGES", "EMBED_LINKS"]
};
