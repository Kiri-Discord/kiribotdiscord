const Discord = require("discord.js");

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
    return message.channel.send(`Ouch. Jezzz you gave me a wrong mention or user ID 😔`); 
  }

  

  
  let avatar = user.displayAvatarURL({size: 4096, dynamic: true});
  // 4096 is the new biggest size of the avatar.
  // Enabling the dynamic, when the user avatar was animated/GIF, it will result as a GIF format.
  // If it's not animated, it will result as a normal image format.
  
  const embed = new Discord.MessageEmbed()
  .setTitle(`${user.tag} avatar`)
  .setDescription(`[**Avatar URL**](${avatar})`)
  .setColor('#DAF7A6')
  .setImage(avatar)
  .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
  
  return message.channel.send(embed);
}

exports.help = {
  name: "avatar",
  description: "Display a user avatar",
  usage: "avatar [@user | user ID]",
  example: "avatar @Sefy#6822 \n\n\navatar"
}

exports.conf = {
  aliases: ["icon", "pfp", "ava"],
  cooldown: 5
}