
exports.run = async (client, message, args) => {
	message.channel.send('dont hit me in the face lmao');
	
};
exports.help = {
	name: "pong",
	description: "DONT DO THIS",
	usage: "pong",
	example: "pong"
};
  
exports.conf = {
	aliases: ["pong"],
	cooldown: 2
};
