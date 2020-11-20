const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async (client, message, args) => {
	fetch('https://some-random-api.ml/img/birb')
	.then(res => res.json())
	.then(json => {
		const embed = new Discord.MessageEmbed()
		.setTitle('🐦')
		.setImage(json.link)
		.setTimestamp()
		.setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
		message.channel.send(embed)
	  })
	  .catch(err => console.error(err))

};

	
exports.help = {
	name: "bird",
	description: "Get a random bird image",
	usage: "bird",
	example: "bird"
};
  
exports.conf = {
	aliases: [],
	cooldown: 4
};