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
	description: "get a random waifu from bell's homework folder",
	usage: "waifu",
	example: "waifu"
};
  
exports.conf = {
	aliases: [],
	cooldown: 4,
	guildOnly: true
};