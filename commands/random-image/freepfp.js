const Discord = require('discord.js')
const { Random } = require("something-random-on-discord")
const random = new Random();

exports.run = async (client, message, args) => {
	let data = await random.getAnimeImgURL("waifu")


    const num = Math.floor(Math.random() * 100000);
	const embed = new Discord.MessageEmbed()
	.setColor('RANDOM')
	.setDescription(`powered by bell's homework folder`)
	.setImage(data)
    message.channel.send(embed)
}



exports.help = {
	name: "freepfp",
	description: "base on bell's *homework* folder, i will generate a pfp for you 😂\n*no clickbait*",
	usage: "freepfp",
	example: "freepfp"
};
  
exports.conf = {
	aliases: [],
	cooldown: 4,
	guildOnly: true
};
