exports.run = async (client, message, args) => {
	message.channel.send('||mom, you there? mom?.. ||', {files: [{ attachment: "https://i.imgur.com/JmoFRU7.jpeg", name: "SPOILER_help.jpeg"}]});
	
};
exports.help = {
	name: "mom",
	description: "more info about my mom :)",
	usage: "mom",
	example: "mom"
};
  
exports.conf = {
	aliases: ["mom"],
	cooldown: 2
};
  
