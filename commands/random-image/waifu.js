const randomanime = require("random-anime");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    const anime = randomanime.anime();
	const embed = new Discord.MessageEmbed()
	.setDescription(`*powered by bell's homework folder*`)
	.setImage(anime)
	.setColor('RANDOM')

	await message.channel.send(embed)
}

exports.help = {
	name: "waifu",
	description: "bell's homework folder has a lot of **homework**\n*and you know what is this for*",
	usage: "waifu",
	example: "waifu"
};
  
exports.conf = {
	aliases: [],
	cooldown: 4,
	guildOnly: true
};