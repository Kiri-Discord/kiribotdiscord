exports.run = async message => {
	message.channel.send('dont hit me in the face lmao');
	
};
exports.help = {
	name: "pong",
	description: "DONT DO THIS",
	usage: "pong",
	example: "pong"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2,
	guildOnly: false
};
