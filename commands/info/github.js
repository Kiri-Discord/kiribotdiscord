const Discord = require('discord.js');

exports.run = async (client, message, args) => {

	const embed = new Discord.MessageEmbed()
	.setTitle('Support my development!')
	.setURL('https://github.com/ryzenix/sefybotdiscord')
	.setDescription('Visit my GitHub link and and create a pull request to \nsuggest ways to improve myself or suggest anything in my suggestion channel in Sefiria: https://discord.gg/9sduybudF5')
	.setColor('#7E7D7C')
	.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
	.setAuthor('GitHub', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')


	message.channel.send(embed);
	
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