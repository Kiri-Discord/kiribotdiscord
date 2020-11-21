const Discord = require("discord.js"), cooldowns = new Discord.Collection();
// cooldowns will store the user when they are still in the cooldown mode.

module.exports = async (client, message) => {

  if (message.author.bot || message.author === client.user) return;

  if (message.channel.type === "dm") return;

  const setting = await client.dbguilds.findOne({
    guildID: message.guild.id
  });

  const verifydb = await client.dbverify.findOne({
    guildID: message.guild.id,
    userID: message.author.id,
  });

  const prefix = setting.prefix;

  const alreadyHasRole = message.member._roles.includes(setting.verifyRole);

    // Verification Site
  if (message.channel.id === setting.verifyChannelID) { // Verification Text Channel
    // Re-send Code System
    if (message.content.startsWith("resend")) {
      let code = verifydb.code;
      await message.delete();
      let verifyChannel = message.guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);
      const dm = new Discord.MessageEmbed()
      .setColor(0x7289DA)
      .setTitle(`Welcome to ${message.guild.name}!`)
      .setDescription(`Hello! Before you get started, I just want you to verify yourself first.\nPut the below code into the channel ${verifyChannel} to verify yourself.`)
      .addField(`This is your code:`, `||${code}||`)
      await message.author.send(dm).catch(() => {
        return message.reply("Your DM is still locked. Unlock your DM first.")
        .then(i => i.delete({timeout: 10000}));
      })
      
      return message.reply("Check your DM.").then(i => i.delete({timeout: 10000}));
    }
    
    // Verify System
    if (!alreadyHasRole) { // The owner of the bot cannot get any verification codes.
      if (!message.author.bot) { // If the user was a robot, well return it.
        let code = verifydb.code;
        if (message.content !== `${code}`) {
          // If the code that user insert it doesn't the same with the database, return it.
          message.delete()
          message.reply("Are you sure that it is the right code?").then(i => i.delete({timeout: 10000}));
        } 
        if (message.content === `${code}`) {
          message.delete();
          await client.dbverify.findOneAndDelete({
            guildID: message.guild.id,
            userID: message.author.id,
          })
          message.reply(`you have passed my verification! Welcome to ${message.guild.name}!`).then(i => i.delete({timeout: 7500}));
          await message.member.roles.add(setting.verifyRole).catch(() => {
            return message.reply("oof, so this guild's mod forgot to give me the role \`MANAGE_ROLES\` :( can you ask them to verify you instead?")
            .then(i => i.delete({timeout: 10000}));
          })
        }
      }
    } 
  }

  client.emit('experience', message);
  if(!message.content.toLowerCase().startsWith(prefix))return;
  
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let msg = message.content.toLowerCase();
  let cmd = args.shift().toLowerCase();
  let sender = message.author;
  
  message.flags = []
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1)); 
  }

  
  
  let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!commandFile) return; 
  

  if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Discord.Collection());
  
  const member = message.member,
        now = Date.now(),
        timestamps = cooldowns.get(commandFile.help.name),
        cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;
  
  if (!timestamps.has(member.id)) {
    if (!client.config.owners.includes(message.author.id)) {

      timestamps.set(member.id, now);
    }
  } else {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.channel.send(`calm down, you are in cooldown. please wait **${timeLeft.toFixed(1)}** seconds`);
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
