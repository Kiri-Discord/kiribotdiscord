const Discord = require('discord.js');


module.exports = async (client, guild) => {




  const setting = await client.guildlist.findOne({
    guildID: guild.id
  }, (err, guild) => {
    if (err) console.error(err)
    if (!guild) {
      const newGuild = new guildlist({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        guildName: guild.name,
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
  
  guild.owner.send(`Thanks for adding me to your server ${guild.name} \nMy default prefix is ` + `${prefix}` + `\nType ${prefix}help to see a full list of commands. Have fun!`);
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.users.cache.get('639028608417136655').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);



};
