const Pagination = require('discord-paginationembed');
const punchSchema = require('../../model/punch')

exports.run = async (client, message, args, prefix) => {
    let data = await punchSchema.find({
        guildId: message.guild.id,
    }).sort([["received", "descending"]]);
    if (!data || !data.length) return message.channel.send({embed: {color: "f3f3f3", description: `❌ seems like no one in your guild has decided to punch yet :grinning: once someone is punched, their punch count will show here :pensive:`}});
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
};
exports.help = {
	name: "punchboard",
	description: "display the guild's punch leaderboard",
	usage: "punchboard",
	example: "punchboard"
};
  
exports.conf = {
	aliases: ["pb"],
  cooldown: 3,
  guildOnly: true,
  
	channelPerms: ["MANAGE_MESSAGES", "EMBED_LINKS"]
};
