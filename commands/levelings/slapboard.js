const Pagination = require('discord-paginationembed');
const slapSchema = require('../../model/slap');

exports.run = async (client, message, args, prefix) => {
    let data = await slapSchema.find({
        guildId: message.guild.id,
    }).sort([["received", "descending"]]);
    if (!data || !data.length) return message.channel.send({embed: {color: "f3f3f3", description: `❌ seems like no one in your guild has decided to slap yet :grinning: once someone is hugged, their hug count will show here!`}});
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
          slapSchema.findOneAndDelete({
            userId: user.userId,
            guildId: message.guild.id,
          }, (err) => {
            if (err) console.error(err)
          });
          arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| was slapped \`${user.received}\` time${addS}`);
        } else {
          arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** was slapped \`${user.received}\` time${addS}`);
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
    .setAuthor(`these are users that received slap in ${message.guild.name} :(`, message.author.displayAvatarURL())
    .setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
    .setDescription(`you can slap others with \`${prefix}slap\` :pensive:`)
    FieldsEmbed.build();

    // await slapSchema.find({
    //     guildId: message.guild.id,
    // }).sort([["received", "descending"]]).exec((err, res) => {
    //     if (err) {
    //         console.log(err)
    //         return message.inlineReply("sorry, there was an error while executing this command :(");
    //     }
    //     let embed = new MessageEmbed()
    //     .setThumbnail(message.guild.iconURL())
    //     .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    //     .setAuthor(`slap leaderboard for ${message.guild.name}:`, client.user.displayAvatarURL())
    //     .setDescription(`these are users with that received the most slap in this server.\ni will only show 5 people received the most slap :pensive:`)
    //     .setColor('RANDOM')
    //     .setTimestamp(new Date())

    //     if (res.length === 0) {
    //         return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, i can't find any slap data for this guild :(`}});
    //     } else if (res.length < 5) {
    //         for (i = 0; i < res.length; i++) {
    //             let member = message.guild.members.cache.get(res[i].userId) || "Left user"
    //             if (member === "Left user")  {
    //                     slapSchema.findOneAndDelete({
    //                         userId: res[i].userId,
    //                         guildId: message.guild.id,
    //                     }, (err) => {
    //                         if (err) console.error(err)
    //                     });
    //             } else {
    //                 embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} slap(s)`);
    //             }
    //         }
    //     } else {
    //         for (i = 0; i < 5; i++) {
    //             let member = message.guild.members.cache.get(res[i].userId) || "Left user"
    //             if (member === "Left user") {
    //                     slapSchema.findOneAndDelete({
    //                         userId: res[i].userId,
    //                         guildId: message.guild.id,
    //                     }, (err) => {
    //                         if (err) console.error(err)
    //                     });
    //             } else {
    //                 embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} slap(s)`);
    //             }
    //         }
    //     }
    //     message.channel.send(embed)
    // })
};
exports.help = {
	name: "slapboard",
	description: "display the guild's slap leaderboard",
	usage: "slapboard",
	example: "slapboard"
};
  
exports.conf = {
	aliases: ["sb"],
    cooldown: 2,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
