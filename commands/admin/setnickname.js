const Discord = require("discord.js");

exports.run = async (client, message, args) => {

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

  
  if (!message.member.hasPermission(["MANAGE_GUILD", "ADMINISTRATOR"])) {
    return message.channel.send(`you do not have \`MANAGE_GUILD\` or \`ADMINISTRATOR\` permission to use this command 😔`).then(m => m.delete({ timeout: 5000 }));
  }
  
  let user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
  if (!user) return message.channel.send("p l e a s e mention the user properly or provide me with a valid ID :V");
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
    return message.channel.send("Ouch, i bumped by an error :( Can you check my perms? That user also might have a higher role than me btw");
  });

  const rolelog = new Discord.MessageEmbed()
  .setAuthor(client.user.tag, client.user.displayAvatarURL())
  .setDescription(`Successfully changed **${user}** nickname to **${nick}**`)
  .addField('Target user ID', user.id)
  .addField('Moderator', message.author)



}

exports.help = {
  name: "setnickname",
  description: "Set a user nickname.",
  usage: "setnickname <@user> <nick>",
  example: "setnickname @bell#9999 hoisted"
}

exports.conf = {
  aliases: ["setnick"],
  cooldown: 5
}
