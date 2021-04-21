const Pagination = require('discord-paginationembed');
const punchSchema = require('../../model/punch')

exports.run = async (client, message, args, prefix) => {
    let data = await punchSchema.find({
        guildId: message.guild.id,
    }).sort([["received", "descending"]]);
    if (!data || !data.length) return message.channel.send({embed: {color: "f3f3f3", description: `❌ seems like no one in your guild has decided to punch yet :grinning: once someone is hugged, their hug count will show here!`}});
    const emoji = {
        "1": ":crown:",
        "2": ":trident:",
        "3": ":trophy:",
        "4": ":medal:",
        "5": ":zap:"
    };

    let arr = [];

    data.map((user, index) => {
        let member = message.guild.members.cache.get(user.userId);
        const addS = user.received === 1 ? '' : 's';
        if (!member) {
          punchSchema.findOneAndDelete({
            userId: user.userId,
            guildId: message.guild.id,
          }, (err) => {
            if (err) console.error(err)
          });
          arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| was punched \`${user.received}\` time${addS}`);
        } else {
          arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** was punched \`${user.received}\` time${addS}`);
        }
    });
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
    .setAuthor(`these are users that received punch in ${message.guild.name} :(`, message.author.displayAvatarURL())
    .setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
    .setDescription(`you can punch others with \`${prefix}punch\` :pensive:`)
    FieldsEmbed.build();

    // await punchSchema.find({
    //     guildId: message.guild.id,
    // }).sort([["received", "descending"]]).exec((err, res) => {
    //     if (err) {
    //         console.log(err)
    //         return message.inlineReply("sorry, there was an error while executing this command :(");
    //     }
    //     let embed = new MessageEmbed()
    //     .setThumbnail(message.guild.iconURL())
    //     .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    //     .setAuthor(`punch leaderboard for ${message.guild.name}:`, client.user.displayAvatarURL())
    //     .setDescription(`these are users with that received the most punch in this server.\ni will only show 5 people received the most punch :pensive:`)
    //     .setColor('RANDOM')
    //     .setTimestamp(new Date())

    //     if (res.length === 0) {
    //         return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, i can't find any punch data for this guild :(`}});
    //     } else if (res.length < 5) {
    //         for (i = 0; i < res.length; i++) {
    //             let member = message.guild.members.cache.get(res[i].userId) || "Left user"
    //             if (member === "Left user")  {
    //                     punchSchema.findOneAndDelete({
    //                         userId: res[i].userId,
    //                         guildId: message.guild.id,
    //                     }, (err) => {
    //                         if (err) console.error(err)
    //                     });
    //             } else {
    //                 embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} punch(s)`);
    //             }
    //         }
    //     } else {
    //         for (i = 0; i < 5; i++) {
    //             let member = message.guild.members.cache.get(res[i].userId) || "Left user"
    //             if (member === "Left user") {
    //                     punchSchema.findOneAndDelete({
    //                         userId: res[i].userId,
    //                         guildId: message.guild.id,
    //                     }, (err) => {
    //                         if (err) console.error(err)
    //                     });
    //             } else {
    //                 embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} punch(s)`);
    //             }
    //         }
    //     }
    //     message.channel.send(embed)
    // })
};
exports.help = {
	name: "punchboard",
	description: "display the guild's punch leaderboard",
	usage: "punchboard",
	example: "punchboard"
};
  
exports.conf = {
	aliases: ["pb"],
    cooldown: 2,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
