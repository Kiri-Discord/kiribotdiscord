const mongoose = require('mongoose');
const Guild = require('../../model/guild');


exports.run = async (client, message, args) => {
	if (!message.member.hasPermission('MANAGE_GUILD')) {
        return message.channel.send('You do not have permission to use this command!').then(m => m.delete({timeout: 10000}));
    };
    
    const settings = await Guild.findOne({
        guildID: message.guild.id
      }, (err, guild) => {
        if (err) console.error(err)
        if (!guild) {
          const newGuild = new Guild({
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
        return message.channel.send(`You must specify a prefix to set for your guild! Your current guild prefix is \`${settings.prefix}\``).then(m => m.delete({timeout: 10000}));
    };

    await settings.updateOne({
        prefix: args[0]
    });

    return message.channel.send(`Your guild prefix has been updated to \`${args[0]}\``);

    
};


exports.help = {
  name: "setprefix",
  description: "Change the way you call me",
  usage: `setprefix <prefix>`,
  example: `setprefix s!`
}

exports.conf = {
  aliases: ["setprefix"],
  cooldown: 5
}
