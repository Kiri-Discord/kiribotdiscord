const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async (client, message, args) => {
	fetch('https://some-random-api.ml/img/dog')
	.then(res => res.json())
	.then(json => {
		const embed = new Discord.MessageEmbed()
		.setTitle('🐶')
		.setImage(json.link)
		message.channel.send(embed)
	  })
	.catch(err => console.error(err))

};

	
exports.help = {
	name: "dog",
	description: "Get a random dog image from Reddit",
	usage: "dog",
	example: "dog"
};
  
exports.conf = {
	aliases: [],
	cooldown: 4
};