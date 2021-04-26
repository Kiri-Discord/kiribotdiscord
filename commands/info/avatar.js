const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
  let member = await getMemberfromMention(args[0], message.guild) || message.member;
  let user = member.user;

  const avatar = user.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
  
  const embed = new MessageEmbed()
  .setTitle(`${user.tag} avatar`)
  .setDescription(`[Avatar URL](${avatar})`)
  .setColor(member.displayHexColor)
  .setImage(avatar)
  .setTimestamp(new Date())
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
  
	channelPerms: ["EMBED_LINKS"]
}