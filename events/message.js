const { findBestMatch } = require("string-similarity");
const { Collection } = require("discord.js");
const cooldowns = new Collection();
const agreed = new Collection();
const { MessageEmbed } = require('discord.js');

module.exports = async (client, message) => {

  if (message.author.bot || message.author.id === client.user.id) return;

  let prefix;
  let setting;

  let globalStorage = client.globalStorage;
  let storage = await globalStorage.findOne();
  if (!storage) storage = new globalStorage();

  const alreadyAgreed = storage.acceptedRules.includes(message.author.id);

  if (message.channel.type === "dm") {
    prefix = client.config.prefix
  } else {
    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;
    setting = await client.dbguilds.findOne({
      guildID: message.guild.id
    });
    if (!setting) {
      const dbguilds = client.dbguilds
      setting = new dbguilds({
        guildID: message.guild.id
      });
      await setting.save();
      prefix = setting.prefix;
    } else {
      prefix = setting.prefix;
    }
    const alreadyHasVerifyRole = message.member.roles.cache.has(setting.verifyRole);
    if (message.channel.id === setting.verifyChannelID) {
      if (alreadyHasVerifyRole) {
        return message.channel.send(`you just messaged in a verification channel! to change or remove it, do \`${prefix}setverify [-off]\` or see \`${prefix}help setverify\``).then(async m => {
          await message.delete();
          m.delete({ timeout: 4000 });
        })
      } else {
        return client.emit('verify', message);
      }
    };
    if (setting.enableLevelings && message.channel.type === "text") {
      client.emit('experience', message, setting);
    };
  };
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);


  if (!prefixRegex.test(message.content)) return;
  const [, matchedPrefix] = message.content.match(prefixRegex);

  const blush = client.customEmojis.get('blush') ? client.customEmojis.get('blush') : ':blush:';
  const sed = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
  const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';
  const sip = client.customEmojis.get('sip') ? client.customEmojis.get('sip') : ':thinking:';
  const stare = client.customEmojis.get('staring') ? client.customEmojis.get('staring') : ':thinking:';

  let execute = message.content.slice(matchedPrefix.length).trim();
  if (!execute) {
    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (prefixMention.test(matchedPrefix)) {
      return message.channel.send(`you just summon me! to use some command, either ping me or use \`${prefix}\` as a prefix! to get help, use \`${prefix}help\`! cya ${duh}`).then(m => m.delete({ timeout: 5000 }));
    } else {
      return;
    }
  }
  let args = execute.split(/ +/g);
  let cmd = args.shift().toLowerCase();
  let sender = message.author;

  message.flags = []
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1)); 
  };
  
  
  let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!commandFile) {
    const matches = findBestMatch(cmd, client.allNameCmds).bestMatch.target;
    return message.channel.send(`i don't remember having that commmand installed ${sip} maybe you mean \`${prefix}${matches}\` ?`).then(m => m.delete({ timeout: 5000 }));
  };
  if (!alreadyAgreed && !client.config.owners.includes(message.author.id)) {
    if (message.channel.type === 'text') {
      if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS'), { checkAdmin: true }) return message.channel.send(`uh ${message.author.username}, it seems like you haven't agreed to the rules when using me yet.\nnormally the rules will show up here when you ask me to do a command for the first time, but this channel has blocked me from showing embed ${sed} can you try it again in an another channel?`)
    };
    const agreedCount = storage.acceptedRules.toObject();
    let key;

    if (message.channel.type === 'dm') key = message.author.id;
    else key = `${message.author.id}-${message.guild.id}`;

    const verifyEmbed = new MessageEmbed()
    .setAuthor(`Rules`, client.user.displayAvatarURL())
    .setColor('#81c42f')
    .setTitle('any failure in following those rules will result in you being temp banned from using my features or your guild being temp banned :warning:')
    .setDescription(`
    • any actions performed to give other users a bad experience are explicitly against the rules ${sed}
    this includes but not limited to:
    ├> using macros/scripts for commands (make me slower in serving other users)
    └> use any of my features for actions that is against the Discord Terms of Service
  
    • do not use any exploits and report any found in the bot in our server!
  
    • you can not sell/trade token or any bot goods for real money
  
    • if you have any questions come ask us in ${blush}
    
    [Sefiria (community server)](https://discord.gg/kJRAjMyEkY)
    [sefy support (support server)](https://discord.gg/D6rWrvS)

    *for your convience, i will only ask for acceptance once. you only have to do this once only.*
    `)
    .setFooter(`${agreedCount.length} user have agreed to those rules :)`);

    const existingCollector = agreed.get(key);

    if (existingCollector) {
      await existingCollector.stop();
    };
    const filter = (reaction, user) => {
      return reaction.emoji.name === '👍' && user.id === message.author.id;
    };
    const verifyMessage = await message.inlineReply(`:warning: you must accept these rules below before using me! react with the hands up emojis to agree with those rules ${duh}`, verifyEmbed);
    await verifyMessage.react('👍');
    const collectedEmojis = verifyMessage.createReactionCollector(filter, { max: 1, time: 20000, errors: ['time'] });
    agreed.set(key, collectedEmojis);
    return agreeCollector(storage, collectedEmojis, message, key);
  };

  if (message.channel.type === "dm" && commandFile.conf.guildOnly) return message.inlineReply(`i can't execute that command inside DMs! ${client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':thinking:'}`);
  if (!message.channel.nsfw && commandFile.conf.adult) {
    const embed2 = new MessageEmbed()
    .setColor(0x7289DA)
    .setDescription(`he will shoot anybody who is trying to do this illegal stuff in normal channel\ndo this in a nsfw channel to make him feel happier`)
    .setTitle('say hi to my uncle')
    .setImage('https://i.pinimg.com/originals/65/96/27/6596276817293850804c8d07162792d5.jpg')
    return message.channel.send(embed2).catch(() => null)
  };
  
  if (commandFile.conf.userPerms && message.channel.type !== "dm") {
    if (commandFile.conf.userPerms.length) {
      for (permission in commandFile.conf.userPerms) {
        if (!message.member.hasPermission(commandFile.conf.userPerms[permission])) {
          return message.channel.send(`are you a mod? you don't seems to have the \`${commandFile.conf.userPerms[permission]}\` permission for this ${staring}`);
        }
      }
    }
  }
  if (commandFile.conf.channelPerms && message.channel.type !== 'dm') {
    if (commandFile.conf.channelPerms.length) {
      for (permission in commandFile.conf.channelPerms) {
        if (!message.channel.permissionsFor(message.guild.me).has(commandFile.conf.channelPerms[permission])) {
          return message.channel.send(`ouch! bruh it seems like i don't have the \`${commandFile.conf.channelPerms[permission]}\` permission in this channel to properly do that for you ${sed}\ncan you move to an another channel where i have that permission?`);
        };
      }
    }
  }
  if (commandFile.conf.clientPerms && message.channel.type !== "dm") {
    if (commandFile.conf.clientPerms.length) {
      for (permission in commandFile.conf.clientPerms) {
        if (!message.guild.me.hasPermission(commandFile.conf.clientPerms[permission])) {
          return message.channel.send(`sorry, i don't have \`${commandFile.conf.clientPerms[permission]}\` permission across the server to do that ${sed}`)
        };
      }
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
      return message.channel.send(`calm down, you are in cooldown :( can you wait **${timeLeft.toFixed(1)}** seconds? ${sed}`).then(m => m.delete({ timeout: 5000 }));
    }
    
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
  }

  try {
    if (!commandFile) return;
    commandFile.run(client, message, args, prefix);
    console.log(`${sender.tag} (${sender.id}) from ${message.channel.type === 'dm' ? 'DM' : `${message.guild.name} (${message.guild.id})`} ran a command: ${prefix}${cmd}`);
  } catch (error) {
    console.error(error);
  }
};

async function agreeCollector(storage, collector, message, key) {
  collector.on('collect', async () => {
    await collector.stop();
    storage.acceptedRules.push(message.author.id);
    await storage.save();
  });
  
  collector.on('end', () => {
    agreed.delete(key);
  });
}
