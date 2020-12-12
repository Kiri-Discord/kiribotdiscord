exports.run = async (client, message, args) => {
  const settings = await client.dbguilds.findOne({
    guildID: message.guild.id
  });
	if (!message.member.hasPermission('MANAGE_GUILD')) {
        return message.reply('you don\'t have the \`MANAGE_GUILD\` permission to use this command 😔').then(m => m.delete({timeout: 10000}));
  };

  if (args.length < 1) {
      return message.channel.send({embed: {color: "f3f3f3", description: `ℹ️ my current guild prefix here is \`${settings.prefix}\` you could use \`${settings.prefix}setprefix <prefix>\` to change it :D`}}).then(m => m.delete({timeout: 10000}));
  };

  await client.dbguilds.findOneAndUpdate({
    guildID: message.guild.id,
  },
  {
    prefix: args[0]
  })
  .catch(err => console.error(err));


  return message.channel.send({embed: {color: "f3f3f3", description: `☑️ my current guild prefix here has been updated to \`${args[0]}\``}});

    
};


exports.help = {
  name: "setprefix",
  description: "change my prefix..pretty self-explanatory huh :D",
  usage: "setprefix `<prefix>`",
  example: "setprefix `s!`"
}

exports.conf = {
  aliases: ["prefix"],
  cooldown: 5,
  guildOnly: true,
  userPerms: ["MANAGE_GUILD"],
	clientPerms: []
}
