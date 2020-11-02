
exports.run = async (client, message, args) => {
	message.channel.send('pong.');
	
};
exports.help = {
	name: "ping",
	description: "very self-explanatory",
	usage: "ping",
	example: "ping"
};
  
exports.conf = {
	aliases: ["ping"],
	cooldown: 2
};
  
