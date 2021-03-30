const Discord = require("discord.js");
const { getAverageColor } = require('fast-average-color-node');

exports.run = async (client, message, args) => {  
  let user;
  try {
    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    } else if (args[0]) {
      user = message.guild.members.cache.get(args[0]).user;
    } else {
      user = message.author;
    }
  } catch (error) {
    return message.channel.send(`Ouch. Jezzz you gave me a wrong mention or user ID 😔`).then(m => m.delete({ timeout: 5000 }));
  }

  const avatar = user.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
  const color = await getAverageColor(avatar, { algorithm: 'simple' });
  
  const embed = new Discord.MessageEmbed()
  .setTimestamp(new Date())
  .setTitle(`${user.tag} avatar`)
  .setDescription(`[Avatar URL](${avatar})`)
  .setColor(color.hex)
  .setImage(avatar)
  .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
  
  return message.channel.send(embed);
}

exports.help = {
  name: "avatar",
  description: "Display a user avatar",
  usage: ["avatar [@user]", "avatar [user ID]"],
  example: ["avatar `@Sefy#6822`", "avatar 84878844578778", "avatar"]
}

exports.conf = {
  aliases: ["icon", "pfp", "ava"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}