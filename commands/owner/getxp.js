exports.run = async (client, message, args) => {
  if (!client.config.owners.includes(message.author.id)) return;
  const res = client.leveling.getLevelBounds(args[0])
  message.channel.send(`${res.lowerBound}, ${res.upperBound}`)
	
};



exports.help = {
  name: "getxp",
  description: "very self-explanatory",
  usage: `getxp`,
  example: `getxp`
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
}
