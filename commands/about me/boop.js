exports.run = async (client, message, args) => {
	message.inlineReply('are you in pain?');
	
};
exports.help = {
	name: "boop",
	description: "if you run this you autist",
	usage: "boop",
	example: "boop"
};
  
exports.conf = {
    aliases: [],
	cooldown: 2,
};