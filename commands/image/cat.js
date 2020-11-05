const fetch = require('node-fetch')
const Discord = require('discord.js')

exports.run = async (client, message, args) => {
	fetch('https://some-random-api.ml/img/cat')
	.then(res => res.json())
	.then(json => {
		const embed = new Discord.MessageEmbed()
		.setTitle('*cat*')
        .setImage(json.link)
		.setTimestamp()
		.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
		message.channel.send(embed)
	  })
	  .catch(err => console.error(err))

};

	
exports.help = {
	name: "cat",
	description: "Get a random cat image",
	usage: "cat",
	example: "cat"
};
  
exports.conf = {
	aliases: ["cat"],
	cooldown: 4
};