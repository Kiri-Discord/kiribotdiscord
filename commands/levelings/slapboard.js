const Pagination = require('discord-paginationembed');
const slapSchema = require('../../model/slap');

exports.run = async (client, message, args, prefix) => {
    let data = await slapSchema.find({
        guildId: message.guild.id,
    }).sort([["received", "descending"]]);
    if (!data || !data.length) return message.channel.send({embed: {color: "f3f3f3", description: `❌ seems like no one in your guild has decided to slap yet :grinning: once someone is hugged, their slapped count will show here :pensive:`}});
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
};
exports.help = {
	name: "slapboard",
	description: "display the guild's slap leaderboard",
	usage: "slapboard",
	example: "slapboard"
};
  
exports.conf = {
	aliases: ["sb"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  channelPerms: ["MANAGE_MESSAGES", "EMBED_LINKS"]
};
