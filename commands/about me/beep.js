exports.run = async (client, message, args) => {
  const blessEmoji = client.customEmojis.get('bless') ? client.customEmojis.get('bless') : '✔️' ;
	return message.channel.send({embed: {color: "f3f3f3", description: `${blessEmoji} **boop!** took me **${(Date.now() - message.createdTimestamp)}ms** to reply, and the Discord API has a latency of **${Math.round(client.ws.ping)}ms**!`}});
};

exports.help = {
  name: "beep",
  description: "very self-explanatory",
  usage: `beep`,
  example: `beep`
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: false,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
}
