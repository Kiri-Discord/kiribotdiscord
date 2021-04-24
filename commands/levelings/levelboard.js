const Pagination = require('discord-paginationembed');

exports.run = async (client, message, args) => {
  let data = await client.dbleveling.find({
    guildId: message.guild.id,
  }).sort({
    xp: -1
  });
  if (!data || !data.length) return message.channel.send({embed: {color: "f3f3f3", description: `❌ i can't find any leveling data for this guild :( try chatting more to level up :D`}});

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
    if (!member) {
      client.dbleveling.findOneAndDelete({
        userId: user.userId,
        guildId: message.guild.id,
      }, (err) => {
        if (err) console.error(err)
      });
      arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| —  Level: \`${user.level}\` | XP: \`${user.xp}\``);
    } else {
      arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** — Level: \`${user.level}\` | XP: \`${user.xp}\``);
    }
  });
  let rank = message.guild.memberCount;
  for (let counter = 0; counter < data.length; ++counter) {

    let member = message.guild.members.cache.get(data[counter].userId)

    if (!member) {
      client.dbleveling.findOneAndDelete({
          userId: data[counter].userId,
          guildId: message.guild.id,
      }, (err) => {
          if (err) console.error(err)
      });

    } else if (member.user.id === message.author.id) {
      rank = counter + 1
    }
  };

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
  .setAuthor(`leveling leaderboard for ${message.guild.name}:`, message.author.displayAvatarURL())
  .setFooter(`you are ranked ${rank} in this guild :)`)
  .setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
  .setDescription(`you can level up by [sending messages](https://support.discord.com/hc/en-us/articles/360034632292-Sending-Messages) in ${message.guild.name}!`)
  FieldsEmbed.build();
}

exports.help = {
	name: "levelboard",
	description: "show the guild's leveling leaderboard :D",
	usage: "levelboard",
	example: "levelboard"
};
  
exports.conf = {
	aliases: ["lvb"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
	channelPerms: ["MANAGE_MESSAGES", "EMBED_LINKS"]
};
