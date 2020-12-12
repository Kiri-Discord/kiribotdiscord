exports.run = async (client, message, args) => {
	message.channel.send('dont hit me in the face lmao');
	
};
exports.help = {
	name: "pong",
	description: "DON'T DO THIS",
	usage: "pong",
	example: "pong"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2,
	guildOnly: false,
	userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};
