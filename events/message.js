const { findBestMatch } = require("string-similarity");
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = async (client, message) => {

  if (message.author.bot || message.author === client.user) return;

  let prefix;
  let setting;

  if (message.channel.type === "dm") {
    prefix = client.config.prefix
  } else {
    setting = await client.dbguilds.findOne({
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
      if (setting.enableLevelings && message.channel.type === "text") {
        client.emit('experience', message, setting);
      }
    }
  }
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);


  if (!prefixRegex.test(message.content)) return;
  const [, matchedPrefix] = message.content.match(prefixRegex);
  let execute = message.content.slice(matchedPrefix.length).trim();
  if (!execute) return message.channel.send(`you just summon me! to use some command, either ping me or use \`${prefix}\` as a prefix! cya ${client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:'}`).then(m => m.delete({ timeout: 5000 }));
  let args = execute.split(/ +/g);
  let cmd = args.shift().toLowerCase();
  let sender = message.author;
  const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (prefixMention.test(matchedPrefix)) {
    const content = args.join(" ");
    if (!prefixMention.test(content) && message.channel.type !== "dm") {
      message.mentions.users.sweep(user => user.id === client.user.id);
      message.mentions.members.sweep(user => user.id === client.user.id);
    }
  }

  message.flags = []
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1)); 
  }
  
  
  let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!commandFile) {
    const matches = findBestMatch(cmd, client.allNameCmds).bestMatch.target;
    return message.channel.send(`i don't remember having that commmand installed ${client.customEmojis.get('sip') ? client.customEmojis.get('sip') : ':thinking:'} maybe you mean \`${prefix}${matches}\` ?`).then(m => m.delete({ timeout: 5000 }));
  }

  if (message.channel.type === "dm" && commandFile.conf.guildOnly) return message.reply(`i can't execute that command inside DMs! ${client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':thinking:'}`);

  
  if (commandFile.conf.userPerms && message.channel.type !== "dm") {
    for (permission in commandFile.conf.userPerms) {
      if (!message.member.hasPermission(commandFile.conf.userPerms[permission])) {
        return message.reply(`sorry, you don't have ${commandFile.conf.userPerms.map(x => `\`${x}\``).join(" and ")} permission, so i can't do that ${client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'}`);
      }
    }
  }

  if (commandFile.conf.clientPerms && message.channel.type !== "dm") {
    for (permission in commandFile.conf.clientPerms) {
      if (!message.guild.me.hasPermission(commandFile.conf.clientPerms[permission])) {
        return message.reply(`sorry, i don't have ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission to do this for you ${client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'}`).catch(() => {
          message.author.send(`sorry, i don't have ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission in **${message.guild.name}** to do that for you ${client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'}`).catch(() => {
            return;
          })
        });
      };
    }
  }
  

  if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Collection());

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
      return message.channel.send(`calm down, you are in cooldown :( can you wait **${timeLeft.toFixed(1)}** seconds? ${client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'}`).then(m => m.delete({ timeout: 5000 }));
    }
    
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
  }

  try {
    if (!commandFile) return;
    commandFile.run(client, message, args, prefix);
    console.log(`${sender.tag} (${sender.id}) ran a command: ${cmd}`);
  } catch (error) {
    console.error(error);
  }
};
