const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

  
    const member = await getMemberfromMention(args[0], message.guild);
    const sipEmoji = client.customEmojis.get('sip') ? client.customEmojis.get('sip') : ':thinking:';
    const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare') : ':pensive:';
    if (!member) return message.inlineReply(`i can't find that member in this server ${sipEmoji} can you get me a correct mention or user ID?`);
    
    let nick = args.slice(1).join(" ");
    if (!nick) return message.channel.send("you need to input the nickname!");

    const rolelog = new MessageEmbed()
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setDescription(`Successfully changed **${user}** nickname to **${nick}**`)
    .addField('Target user ID', user.id)
    .addField('Moderator', message.author)

    try {
      await member.setNickname(nick);
      await message.channel.send({embed: {color: "f3f3f3", description: `➕ I changed **${user}** nickname to **${nick}**!`}});
      if (!logChannel) {
        return
      } else {
        return logChannel.send(rolelog);
      }
    } catch (error) {
      return message.inlineReply(`ouch, i bumped by an error ${stareEmoji} can you check my perms? that user also might have a higher role than me btw`);
    }
}

exports.help = {
  name: "setnickname",
  description: "set a user nickname.",
  usage: "setnickname `<@user> <nick>`",
  example: "setnickname `@bell#9999 hoisted`"
}

exports.conf = {
  aliases: ["setnick"],
  cooldown: 3,
  guildOnly: true,
  userPerms: ["MANAGE_NICKNAMES"],
  clientPerms: ["MANAGE_NICKNAMES"],
	channelPerms: ["EMBED_LINKS"]
}