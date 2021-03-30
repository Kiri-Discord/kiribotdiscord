const Discord = require("discord.js");
const cooldowns = new Discord.Collection();

module.exports = async (client, message) => {

  if (message.author.bot || message.author === client.user) return;

  let prefix;

  if (message.channel.type === "dm") {
    prefix = client.config.prefix
  } else {
    const setting = await client.dbguilds.findOne({
      guildID: message.guild.id
    });
    if (!setting) {
      await client.emit('guildCreate', message.guild);
      return message.channel.send(`somehow your guild disappeared from my bookshelf.. this is not an error :) you can continue with your convo.\n*this might be caused when you kick me and invite me again when i accidently went offline. all your guild setting has been reseted :(\nthe default prefix for me is* \`${client.config.prefix}\``).then(m => m.delete({ timeout: 7000 }));
    } else {
      prefix = setting.prefix;
      const alreadyHasVerifyRole = message.member._roles.includes(setting.verifyRole);
      if (message.channel.id === setting.verifyChannelID) {
        if (alreadyHasVerifyRole) {
          return message.reply(`you just messaged in a verification channel! to change or remove it, do \`${prefix}setverify [-off]\` or either \`${prefix}setverify <#channel | id> <role name | id>\``).then(async m => {
            await message.delete();
            m.delete({ timeout: 4000 });
          })
        } else {
          return client.emit('verify', message);
        }
      };
    }
  }
  const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(prefixMention)) {
    return message.channel.send(`huh? oh btw my prefix on this guild is \`${prefix}\`, cya ${duh}`);
  }
  const staffsv = client.guilds.cache.get('774245101043187712') || client.guilds.cache.get('639028608417136651');

  const duh = staffsv.emojis.cache.find(emoji => emoji.name === 'duh');
  const sed = staffsv.emojis.cache.find(emoji => emoji.name === 'sed');

  client.emit('experience', message);
  
  if (!message.content.toLowerCase().startsWith(prefix)) return;
  
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let msg = message.content.toLowerCase();
  let cmd = args.shift().toLowerCase();
  let sender = message.author;
  
  message.flags = []
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1)); 
  }


  let perms = [];
  let permsme = [];

  
  
  let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!commandFile) return;

  if (message.channel.type === "dm" && commandFile.conf.guildOnly) return message.reply(`i can't execute that command inside DMs! ${duh}`);

  
  if (commandFile.conf.userPerms && message.channel.type !== "dm") {
    for (permission in commandFile.conf.userPerms) {
      if (!message.member.hasPermission(commandFile.conf.userPerms[permission])) {
        return message.reply(`sorry, you don't have ${commandFile.conf.userPerms.map(x => `\`${x}\``).join(" and ")} permission, so i can't do that ${sed}`);
      }
    }
  }

  if (commandFile.conf.clientPerms && message.channel.type !== "dm") {
    for (permission in commandFile.conf.clientPerms) {
      if (!message.guild.me.hasPermission(commandFile.conf.clientPerms[permission])) {
        return message.reply(`sorry, i don't have ${permsme.join(", ")} permission to do this for you ${sed}`).catch(() => {
          message.author.send(`sorry, i don't have ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission in **${message.guild.name}** to do that for you ${sed}`).catch(() => {
            return;
          })
        });
      };
    }
  }
  

  if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Discord.Collection());

  let member;
  
  if (message.channel.type === "dm") {
    member = message.author;
  } else {
    member = message.member
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandFile.help.name);
  const cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;
  
  if (!timestamps.has(member.id)) {
    if (!client.config.owners.includes(message.author.id)) {

      timestamps.set(member.id, now);
    }
  } else {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.channel.send(`calm down, you are in cooldown :( can you wait **${timeLeft.toFixed(1)}** seconds? ${sed}`).then(m => m.delete({ timeout: 5000 }));
    }
    
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
  }

  try {
    if (!commandFile) return;
    commandFile.run(client, message, args, staffsv);
    console.log(`${sender.tag} (${sender.id}) ran a command: ${cmd}`);
  } catch (error) {
    console.error(error);
  }
};
