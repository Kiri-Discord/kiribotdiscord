const Pagination = require('discord-paginationembed');

exports.run = async (client, message, args) => {
  let data = await client.dbleveling.find({
    guildId: message.guild.id,
  }).sort({
    xp: -1
  });
  if (!data) return message.channel.send({embed: {color: "f3f3f3", description: `❌ i can't find any leveling data for this guild :( try chatting more to level up :D`}});

  const emoji = {
    "0": ":crown:",
    "1": ":trident:",
    "2": ":trophy:",
    "3": ":medal:",
    "4": ":four:",
    "5": ":five:"
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
      arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| — XP: **${user.xp}** | Level: **${user.level}**`);
    } else {
      arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** — XP: **${user.xp}** | Level: **${user.level}**`);
    }
  })
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
  .setPageIndicator(true)
  .setAuthorizedUsers([message.author.id])
  .formatField('\u200b', list => list)
  .setChannel(message.channel)

  FieldsEmbed.embed
  .setColor(message.guild.me.displayHexColor)
  .setAuthor(`Leveling leaderboard for ${message.guild.name}:`, client.user.displayAvatarURL())
  .setFooter(`you are ranked ${rank} in this guild :)`)
  .setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))

  FieldsEmbed.build();
}

exports.help = {
	name: "levelboard",
	description: "i will show the guild's leveling leaderboard when you use this. easy to understand, right? :D",
	usage: "levelboard <page>",
	example: "levelboard 2"
};
  
exports.conf = {
	aliases: ["lvb"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
