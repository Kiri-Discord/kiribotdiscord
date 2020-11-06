const mongoose = require('mongoose');
const Guild = require('../../model/guild');


exports.run = async (client, message, args) => {
	if (!message.member.hasPermission('MANAGE_GUILD')) {
        return message.channel.send('You do not have \`Manage Server\` permission to use this command 😔').then(m => m.delete({timeout: 10000}));
    };
    
    const settings = await client.guildlist.findOne({
        guildID: message.guild.id
      }, (err, guild) => {
        if (err) console.error(err)
        if (!guild) {
          const newGuild = new client.guildlist({
            _id: mongoose.Types.ObjectId(),
            guildID: message.guild.id,
            guildName: message.guild.name,
            prefix: client.config.prefix,
            logChannelID: null
          })
    
          newGuild.save()
          .then(result => console.log(result)
          .catch(err => console.error(err))
          )
        }
    });

    if (args.length < 1) {
        return message.channel.send(`Your current guild prefix is \`${settings.prefix}\`. Use ${settings.prefix}setprefix <prefix> to change it.`).then(m => m.delete({timeout: 10000}));
    };

    await settings.updateOne({
        prefix: args[0]
    });

    return message.channel.send(`Your guild prefix has been updated to \`${args[0]}\``);

    
};


exports.help = {
  name: "setprefix",
  description: "Change my prefix",
  usage: `setprefix <prefix>`,
  example: `setprefix s!`
}

exports.conf = {
  aliases: ["setprefix", "prefix"],
  cooldown: 5
}
