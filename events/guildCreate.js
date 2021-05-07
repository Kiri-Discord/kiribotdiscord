const mongoose = require('mongoose');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = async (client, guild) => {
  
  const guildexist = await client.dbguilds.findOne({
    guildID: guild.id
  });

  if (guildexist) return;

  const Guild = client.dbguilds;
  const newGuild = new Guild({
    _id: mongoose.Types.ObjectId(),
    guildID: guild.id,
    prefix: client.config.prefix,
    enableLevelings: false
  });

  await newGuild.save();

  const prefix = client.config.prefix;
  const blush = client.customEmojis.get('blush') ? client.customEmojis.get('blush') : ':blush:';
  const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';
  const sefy = client.customEmojis.get('sefy') ? client.customEmojis.get('sefy') : ':smile:';

  const channels = guild.channels.cache.filter(x => x.type === 'text').filter(x => x.permissionsFor(guild.me).has('SEND_MESSAGES'))
  const channelbutcansendEmbed = guild.channels.cache.filter(x => x.type === 'text').filter(x => x.permissionsFor(guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES']));

  const embed = new MessageEmbed()
  .setTitle("thanks for inviting me to your server :)")
  .setDescription(stripIndents`
  hi, i'm Sefy, formerly a custom bot, is a new bot which is hoping to bring new perks and fun to your server!
  my default prefix is \`${prefix}\`, but mention also works!

  type \`${prefix}help\` to get started! have fun!
  before doing any commands, check if i have the crucial permission to work properly, like sending embed or manage messages (for some command)

  changes are updated quite frequently within the bot such as restarts, updates, etc...
  if you have any questions come ask us in our support server ${duh}
  [Sefiria (community server)](https://discord.gg/kJRAjMyEkY)
  [sefy support (support server)](https://discord.gg/D6rWrvS)
  `)
  .addField(`some of my suggestion for you to get started: ${blush}`, `
  \`${prefix}help\` - display my command list
  \`${prefix}levelings\` and \`${prefix}levelingignore\` - set up levelings, and set a channel to ignore messages from leveling up!
  \`${prefix}setverify\` - set your server's own verification portal, powered by Google reCAPTCHA.
  
  *and many more to come...*
  `)
  .setColor('#DAF7A6')
  .setTimestamp()
  .setAuthor(`hi i'm Sefy!`, client.user.displayAvatarURL())
  .setThumbnail(client.user.displayAvatarURL())

  const log2 = client.channels.cache.get('827954468779327489')
  if (log2) log2.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  await client.users.cache.get('617777631257034783').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  if (channelbutcansendEmbed.size > 0) { 
    channelbutcansendEmbed.first().send(embed);
  } else if (channels.size > 0) {
    channels.first().send(stripIndents`
    **thanks you for inviting me to your server** :tada:
  
    hi, i'm Sefy ${sefy}, formerly a custom bot, is a new bot which is hoping to bring new perks and fun to your server!
    my default prefix is \`${prefix}\`, but mention also works!
    type \`${prefix}help\` to get started! have fun!
    before doing any commands, check if i have the crucial permission to work properly, like sending embed or manage messages (for some command)
  
    changes are updated quite frequently within the bot such as restarts, updates, etc...
    if you have any questions come ask us in our support server by typing \`${prefix}invite\`
  
    **some of my suggestion for you to get started:** ${blush}
  
    \`${prefix}help\` - display my command list
    \`${prefix}levelings\` and \`${prefix}levelingignore\` - set up levelings, and set a channel to ignore messages from leveling up!
    \`${prefix}setverify\` - set your server's own verification portal, powered by Google reCAPTCHA.
    
    *and many more to come...*
    `)
  } else {
    return;
  }
};