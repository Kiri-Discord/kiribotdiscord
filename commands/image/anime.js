const randomanime = require("random-anime");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    const anime = randomanime.anime();
    const embed = new Discord.MessageEmbed().setColor('#DAF7A6').setTimestamp(new Date()).setDescription(`powered by bell's homework folder`).setTitle("i found this..").setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL()).setImage(anime)
    message.channel.send(embed)
}

exports.help = {
	name: "anime",
	description: "Get a random anime image from bell's homework folder",
	usage: "anime",
	example: "anime"
};
  
exports.conf = {
	aliases: ["anime"],
	cooldown: 4
};