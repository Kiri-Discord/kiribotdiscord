exports.run = async (client, message, args) => {
  if (!client.config.owners.includes(message.author.id)) return message.channel.send('only coco or bell can execute this command!');
  const guild = client.guilds.cache.get(args[0]);
  if (!guild) return message.channel.send('guild not found.');
  const channels = guild.channels.cache.find(channel => channel.type === 'text');
  if (!channels) return message.channel.send('no channel was found in that guild in order to create an invite.. wait what?');
  const invite = await channels.createInvite();
  if (!invite) return message.channel.send('NO PERMISSION AT ALL');
  return message.channel.send(`here is your invite to ${guild.name}: ${invite.url}`)
}

exports.help = {
  name: "guilds-invite",
  description: "hmm",
  usage: `guilds-invite`,
  example: `guilds-invite`
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "CREATE_INSTANT_INVITE"]
}

