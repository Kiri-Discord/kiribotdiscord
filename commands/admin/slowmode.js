const ms = require("ms");

exports.run = async (client, message, args) => {
  if (!message.member.permissions.any(["ADMINISTRATOR", "MANAGE_CHANNELS"])) {
    return message.channel.send("you don\'t have the \`MANAGE_CHANNELS\` or the \`ADMINISTRATOR\` permission to use this command 😔");
  }

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
  
  if (!time) return message.channel.send("please includes the time format. all valid time format are \`s, m, hrs\`!");
  
  let convert = ms(time); // This will results the milliseconds.
  let toSecond = Math.floor(convert / 1000); // This will convert the ms to s. (seconds)
  
  if (!toSecond || toSecond == undefined) return message.channel.send("please insert the valid time format! all valid time format are \`s, m, hrs\`!");
  
  if (toSecond > 21600) return message.channel.send("the timer should be less than or equal to 6 hours!");
  else if (toSecond < 1) return message.channel.send("the timer should be more than or equal to 1 second!");
  const rolelog = new Discord.MessageEmbed()
  .setAuthor(client.user.tag, client.user.displayAvatarURL())
  .setDescription(`Successfully set slowmode for <#${channel.id}> for **${ms(ms(time), {long: true})}**.`)
  .addField('Moderator', message.author)
  
  await channel.setRateLimitPerUser(toSecond).then(() => {
    if (!logChannel) {
        return
    } else {
        return logChannel.send(rolelog);
    }
  }).then(() => {
    message.channel.send({embed: {color: "f3f3f3", description: `this channel: <#${channel.id}> will have slowmode turn on for **${ms(ms(time), {long: true})}**.`}});
  }).catch(err => {
    return message.reply("ouch, i bumped by an error :( can you check my perms?");
  });
}

exports.help = {
  name: "slowmode",
  description: "slow down the channel.",
  usage: "slowmode [channel] <time>",
  example: "slowmode #general 5s \nslowmode 5.25 hrs"
}

exports.conf = {
  aliases: ["slow"],
  cooldown: 10
}