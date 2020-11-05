const Discord = require("discord.js"), cooldowns = new Discord.Collection(), Guild = require('../model/guild'), mongoose = require('mongoose');
// cooldowns will store the user when they are still in the cooldown mode.

module.exports = async (client, message) => {

  if (message.author.bot || message.author === client.user) return;

  if (message.channel.type === "dm") return;

  const setting = await Guild.findOne({
    guildID: message.guild.id
  }, (err, guild) => {
    if (err) console.error(err)
    if (!guild) {
      const newGuild = new Guild({
        _id: mongoose.Types.ObjectId(),
        guildID: message.guild.id,
        guildName: message.guild.name,
        prefix: client.config.prefix,
        logChannelID: null
      })

      newGuild.save()
      .then(result => console.log(result)
      .catch(err => console.error(err))
      )
    }
  }); 

  const prefix = setting.prefix;




  // Prevent any chit-chats with other bots, or by himself. 

  // If the user doesn't doing any to the bot, return it.
  if (!message.content.startsWith(prefix)) return;
  
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let msg = message.content.toLowerCase();
  let cmd = args.shift().toLowerCase();
  let sender = message.author;
  
  message.flags = []
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1)); // Example: /play -soundcloud UP pice
  }

  
  
  let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!commandFile) return; // If the commands doesn't exist, ignore it. Don't send any warning on this.
  
  // This will set a cooldown to a user after typing a command.
  if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Discord.Collection());
  
  const member = message.member,
        now = Date.now(),
        timestamps = cooldowns.get(commandFile.help.name),
        cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;
  
  if (!timestamps.has(member.id)) {
    if (!client.config.owners.includes(message.author.id)) {
      // If the user wasn't you or other owners that stored in config.json
      timestamps.set(member.id, now);
    }
  } else {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.channel.send(`Calm down dude, please wait **${timeLeft.toFixed(1)}** seconds to try the command again.`);
    }
    
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount); // This will delete the cooldown from the user by itself.
  }
  
  try {
    if (!commandFile) return;
    commandFile.run(client, message, args);
    console.log(`${sender.tag} (${sender.id}) ran a command: ${cmd}`);
  } catch (error) {
    console.error(error);
  }
};
