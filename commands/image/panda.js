const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async (client, message, args) => {
	fetch('https://some-random-api.ml/img/panda')
	.then(res => res.json())
	.then(json => {
		const embed = new Discord.MessageEmbed()
		.setTitle('*panda*')
		.setImage(json.link)
		.setTimestamp()
		.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
		message.channel.send(embed)
	  })
	  .catch(err => console.error(err))

};

	
exports.help = {
	name: "panda",
	description: "Get a random panda image",
	usage: "panda",
	example: "panda"
};
  
exports.conf = {
	aliases: ["panda"],
	cooldown: 4
};