const { MessageEmbed } = require("discord.js");
const { stripIndents } = require('common-tags');

exports.run = async (client, message, args) => {
  let member = await getMemberfromMention(args[0], message.guild) || message.member;
  let { user } = member;

  const avatar = user.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
  
  const embed = new MessageEmbed()
  .setTitle(`${user.tag}`)
  .setDescription(stripIndents`
  ID: \`${user.id}\`
  [**Avatar URL**](${avatar})
  `)
  .setColor(member.displayHexColor)
  .setImage(avatar)
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