const ms = require("ms");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);
  
  let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
      time = args.slice(1).join(" ");
  
  if (!channel) time = args.join(" "), channel = message.channel;
  // If the user doesn't includes the channel.
  
  if (message.flags[0] === "off") {
    channel.setRateLimitPerUser(0);
    return message.channel.send(`<#${channel.id}> slowmode has been deactivated.`);
  }
  
  if (!time) return message.reply("please includes the time format. all valid time format are \`s, m, hrs\`!");
  
  let convert = ms(time); // This will results the milliseconds.
  let toSecond = Math.floor(convert / 1000); // This will convert the ms to s. (seconds)
  
  if (!toSecond || toSecond == undefined) return message.reply("please insert the valid time format! all valid time format are \`s, m, hrs\`!");
  
  if (toSecond > 21600) return message.reply("the timer should be more than or equal to 1 second or less than 6 hours!");
  const rolelog = new Discord.MessageEmbed()
  .setAuthor(client.user.username, client.user.displayAvatarURL())
  .setDescription(`Successfully set slowmode for <#${channel.id}> for **${ms(ms(time), {long: true})}**.`)
  .addField('Moderator', message.author)
  
  await channel.setRateLimitPerUser(toSecond).then(() => {
    message.channel.send({embed: {color: "f3f3f3", description: `☑️ this channel: <#${channel.id}> will have slowmode turn on for **${ms(ms(time), {long: true})}**.`}});
  }).then(() => {
    if (!logChannel) {
        return
    } else {
        return logChannel.send(rolelog);
    }
  }).catch(err => {
    return message.reply("ouch, i bumped by an error :( can you check my perms?");
  });
}

exports.help = {
  name: "slowmode",
  description: "slow down the channel.",
  usage: ["slowmode `<time>`", "slowmode `[channel] <time>`", "slowmode `[-off]`"],
  example: ["slowmode `#general 5s`", "slowmode `5.25 hrs`"]
}

exports.conf = {
  aliases: ["slowdown"],
  cooldown: 5,
  guildOnly: true,
  userPerms: ["MANAGE_CHANNELS"],
	clientPerms: ["EMBED_LINKS", "SEND_MESSAGES", "MANAGE_CHANNELS"]
}