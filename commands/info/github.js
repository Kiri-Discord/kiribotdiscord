exports.run = async (client, message, args) => {
	message.channel.send('Support my development! Visit https://github.com/ryzenix/sefybotdiscord and create a pull request to make me better :D');
	
};
exports.help = {
	name: "github",
	description: "Show my GitHub link",
	usage: "github",
	example: "github"
};
  
exports.conf = {
	aliases: ["github", "git"],
	cooldown: 2
};