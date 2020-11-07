const mongoose = require('mongoose');
const Guild = require('../model/guild');
const Discord = require('discord.js');

module.exports = async (client, guild) => {

    await Guild.findOneAndDelete({
        guildID: guild.id
    }, (err) => {
        if (err) console.error(err)
    });   
    

  console.log(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.users.cache.get('617777631257034783').send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

  client.channels.cache.get('774476096409436170').send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
};