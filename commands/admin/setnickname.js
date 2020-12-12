const Discord = require("discord.js");

exports.run = async (client, message, args) => {

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

  
  let user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
  if (!user) return message.reply("p l e a s e mention the user properly or provide me with a valid ID :V");
  let member = message.guild.members.cache.get(user.id);
  
  let nick = args.slice(1).join(" ");
  if (!nick) return message.channel.send("you need to input the nickname!");
  
  member.setNickname(nick).then(() => message.channel.send({embed: {color: "f3f3f3", description: `➕ I changed **${user}** nickname to **${nick}**!`}})).then(() => {
    if (!logChannel) {
        return
    } else {
        return logChannel.send(rolelog);
    }
  }).catch(err => {
    return message.reply("ouch, i bumped by an error :( can you check my perms? that user also might have a higher role than me btw");
  });

  const rolelog = new Discord.MessageEmbed()
  .setAuthor(client.user.username, client.user.displayAvatarURL())
  .setDescription(`Successfully changed **${user}** nickname to **${nick}**`)
  .addField('Target user ID', user.id)
  .addField('Moderator', message.author)

}

exports.help = {
  name: "setnickname",
  description: "set a user nickname.",
  usage: "setnickname <@user> <nick>",
  example: "setnickname @bell#9999 hoisted"
}

exports.conf = {
  aliases: ["setnick"],
  cooldown: 5,
  guildOnly: true,
  userPerms: ["MANAGE_NICKNAMES"],
	clientPerms: ["EMBED_LINKS", "SEND_MESSAGES", "MANAGE_NICKNAMES"]
}
