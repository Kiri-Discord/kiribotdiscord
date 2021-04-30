exports.run = async (client, message, args) => {
	const pingMessage = await message.channel.send(`almost there...`);
	const ping = pingMessage.createdTimestamp - message.createdTimestamp;
	return pingMessage.edit(`🏓 pong! took me roughly ${ping}ms to hit back, and the Discord API has a latency of ${Math.round(client.ws.ping)}ms lol`);
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
};
  
