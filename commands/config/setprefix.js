exports.run = async (client, message, args, prefix) => {

  if (args.length < 1) {
      return message.channel.send({embed: {color: "f3f3f3", description: `ℹ️ my current guild prefix here is \`${prefix}\` you could use \`${prefix}setprefix <prefix>\` to change it :D`}}).then(m => m.delete({timeout: 10000}));
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
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}
