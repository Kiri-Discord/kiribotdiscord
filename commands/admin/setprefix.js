exports.run = async (client, message, args) => {
  const settings = await client.dbguilds.findOne({
    guildID: message.guild.id
  });
	if (!message.member.hasPermission('MANAGE_GUILD')) {
        return message.channel.send('You do not have \`Manage Server\` permission to use this command 😔').then(m => m.delete({timeout: 10000}));
    };

  if (args.length < 1) {
      return message.channel.send(`Your current guild prefix is \`${settings.prefix}\`. Use ${settings.prefix}setprefix <prefix> to change it.`).then(m => m.delete({timeout: 10000}));
  };

  await client.dbguilds.findOneAndUpdate({
    guildID: message.guild.id,
  },
  {
    prefix: args[0]
  })
  .catch(err => console.error(err));


  return message.channel.send(`Your guild prefix has been updated to \`${args[0]}\``);

    
};


exports.help = {
  name: "setprefix",
  description: "Change my prefix",
  usage: `setprefix <prefix>`,
  example: `setprefix s!`
}

exports.conf = {
  aliases: ["prefix"],
  cooldown: 5
}
