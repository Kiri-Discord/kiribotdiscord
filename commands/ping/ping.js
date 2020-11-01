
exports.run = async (client, message, args) => {
	message.reply('pong.');
	
};
exports.help = {
	name: "ping",
	description: "very self-explanatory",
	usage: "ping",
	example: "ping"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2
};
  