const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  let rank;
  let data = await client.dbleveling.find({
    guildId: message.guild.id,
  }).sort({
    xp: -1
  })
  if (!data) return message.channel.send({embed: {color: "f3f3f3", description: `❌ i can't find any leveling data for this guild :( \n\n*try chatting more to level up :D`}});

  var limit = 15;

  let lastpage = Math.ceil(Object.keys(data).length / limit);
  let page = parseInt(args[0]);
  if (!page) page = 1;
  if (page > lastpage) return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, i have no data for page \`${page}\` :(`}});

  let frompages = limit * (page - 1);
  let pageslimit = 15 * page;

  let list = Object.entries(data).sort((a, b) => b[1].xp - a[1].xp).slice(frompages, pageslimit);
  let arr = [];

  for (var i in list) {
    let member = message.guild.members.cache.get(list[i][1].userId)
    if (!member) {
      client.dbleveling.findOneAndDelete({
        userId: list[i][1].userId,
        guildId: message.guild.id,
      }, (err) => {
        if (err) console.error(err)
      });
      arr.push(`✨ \`${i * 1 + 1 + frompages}\` ||Left user|| — XP: **${list[i][1].xp}** | Level: **${list[i][1].level}**`);
    } else {
      arr.push(`✨ \`${i * 1 + 1 + frompages}\` **${member.user.username}** — XP: **${list[i][1].xp}** | Level: **${list[i][1].level}**`);
    }
  };

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
  }

  const embed = new Discord.MessageEmbed()
  .setColor("RANDOM")
  .setAuthor(`Leveling leaderboard for ${message.guild.name}:`, client.user.displayAvatarURL())
  .setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
  .setDescription(`${arr.join("\n")}`)
  .setFooter(`Page: ${page} of ${lastpage} | you are ranked ${rank} in this guild :)`)
  return message.channel.send(embed);
}

exports.help = {
	name: "levelboard",
	description: "i will show the guild's leveling leaderboard when you use this. easy to understand, right? :D",
	usage: "levelboard <page>",
	example: "levelboard 2"
};
  
exports.conf = {
	aliases: ["lvb"],
	cooldown: 5
};
