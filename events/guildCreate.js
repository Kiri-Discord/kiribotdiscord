const Guild = require('../model/guild');
const mongoose = require('mongoose');
const { MessageEmbed } = require('discord.js');

module.exports = async (client, guild) => {
  
  const guildexist = await client.dbguilds.findOne({
    guildID: guild.id
  });

  if (guildexist) return;

  const newGuild = new Guild({
    _id: mongoose.Types.ObjectId(),
    guildID: guild.id,
    prefix: client.config.prefix,
    enableLevelings: false
  })

  await newGuild.save();


  const prefix = client.config.prefix;
  const blush = client.customEmojis.get('blush') ? client.customEmojis.get('blush') : ':blush:';
  const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';

  const embed = new MessageEmbed()
  .setTitle('Thanks for inviting me :D')
  .setDescription(`Thanks for adding me to your server **${guild.name}** ${duh}\nMy default prefix is \`${prefix}\`\n\nType \`${prefix}help\` to get started! Have fun!`)
  .setColor('#DAF7A6')
  .setTimestamp(new Date())
  .setAuthor(client.user.username, client.user.displayAvatarURL())
  .setImage('https://i.imgur.com/1ef8ZEw.png')
  .setFooter('Image by Cabbie #1964')

  const log2 = client.channels.cache.get('827954468779327489')
  if (log2) log2.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

  await guild.owner.send(embed);
  guild.owner.send(`**some of my suggestion for you to get started:** ${blush}\n\n\`${prefix}invite\` - check out our community server and support server.\n\`${prefix}help\` - my command list\n\`${prefix}levelings\` and \`${prefix}levelingignore\` - set up levelings, and set a channel to ignore messages from leveling up\n\`${prefix}invite\` - set your server's own verification portal, powered by Google reCAPTCHA.\n\n*and many more to come...*`)
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.users.cache.get('617777631257034783').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

};
