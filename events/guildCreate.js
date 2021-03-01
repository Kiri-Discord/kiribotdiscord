const mongoose = require('mongoose');
const Guild = require('../model/guild');
const Discord = require('discord.js');

module.exports = async (client, guild) => {

  const guildexist = await client.dbguilds.findOne({
    guildID: guild.id
  });

  if (guildexist) return;


  const newGuild = new Guild({
    _id: mongoose.Types.ObjectId(),
    guildID: guild.id,
    guildName: guild.name,
    prefix: client.config.prefix,
  })

  newGuild.save();

  const prefix = client.config.prefix;

  const embed = new Discord.MessageEmbed()
  .setTitle('Thanks for inviting me :D')
  .setDescription(`Thanks for adding me to your server **${guild.name}** ^^\nMy default prefix is ` + `${prefix}` + `\n\nType ${prefix}help to see a full list of commands. Have fun!`)
  .setColor('#DAF7A6')
  .setTimestamp(new Date())
  .setAuthor(client.user.username, client.user.displayAvatarURL())
  .setImage('https://i.imgur.com/1ef8ZEw.png')
  .setFooter('Image by Cabbie #1964')


  const log1 = client.channels.cache.get('768448397786349578');
  if (log1) log1.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  const log2 = client.channels.cache.get('774476096409436170')
  if (log2) log2.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    
  guild.owner.send(embed);
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.users.cache.get('617777631257034783').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

};
