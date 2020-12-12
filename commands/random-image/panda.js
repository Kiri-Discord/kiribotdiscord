const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async (client, message, args) => {
	fetch('https://some-random-api.ml/img/panda')
	.then(res => res.json())
	.then(json => {
		const embed = new Discord.MessageEmbed()
		.setDescription('🐼')
		.setImage(json.link)
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
	aliases: [],
	cooldown: 3,
	guildOnly: true,
	userPerms: [],
	clientPerms: []
};