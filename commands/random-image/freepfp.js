const Discord = require('discord.js')
const random = require("something-random-on-discord").Random;

exports.run = async (client, message, args) => {
	let data = await random.getAnimeImgURL("waifu")
	const embed = new Discord.MessageEmbed()
	.setColor('RANDOM')
	.setDescription(`powered by bell's homework folder`)
	.setImage(data)
    message.channel.send(embed)
}



exports.help = {
	name: "freepfp",
	description: "generate a pfp for you base on bell's *homework* folder 😂\n*no clickbait*",
	usage: "freepfp",
	example: "freepfp"
};
  
exports.conf = {
	aliases: [],
	cooldown: 4,
	guildOnly: true,
	userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
