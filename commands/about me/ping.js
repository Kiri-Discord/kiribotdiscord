exports.run = async (client, message, args) => {
	return message.channel.send({embed: {color: "f3f3f3", description: `🏓 **pong!** took me roughly **${- (Date.now() - message.createdTimestamp)}ms** to hit back, and the Discord API has a latency of **${Math.round(client.ws.ping)}ms**!`}});
};
exports.help = {
	name: "ping",
	description: "very self-explanatory",
	usage: "ping",
	example: "ping"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2,
	guildOnly: false,
	userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};
  
