const Discord = require("discord.js"), cooldowns = new Discord.Collection();

module.exports = async (client, message) => {

  if (message.author.bot || message.author === client.user) return;

  let prefix;

  if (message.channel.type === "dm") {
    prefix = client.config.prefix
  } else {
    const setting = await client.dbguilds.findOne({
      guildID: message.guild.id
    });
    prefix = setting.prefix
  }

  const staffsv = client.guilds.cache.get('774245101043187712') || client.guilds.cache.get('639028608417136651');

  const duh = staffsv.emojis.cache.find(emoji => emoji.name === 'duh');
  const sed = staffsv.emojis.cache.find(emoji => emoji.name === 'sed');


  const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(prefixMention)) {
    return message.channel.send(`huh? oh btw my prefix on this guild is \`${prefix}\`, cya ${duh}`);
  }

  client.emit('verify', message);
  client.emit('experience', message);
  
  if (!message.content.toLowerCase().startsWith(prefix))return;
  
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

  if (message.channel.type === "dm" && commandFile.conf.guildOnly) return message.reply(`i can't execute that command inside DMs! ${duh}`)
  

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
