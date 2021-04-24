const Discord = require('discord.js');

const fetch = require('node-fetch');

exports.run = async (client, message, args) => {

    const embed = new Discord.MessageEmbed()
	.setColor('#FFC0CB')
	.setDescription(`powered by bell's homework folder`)

    fetch('https://neko-love.xyz/api/v1/neko')
    .then(res => res.json())
    .then(json => embed.setImage(json.url))
    .then(() => message.channel.send(embed))
    .catch(err => {
        message.channel.send("i can't seem to be able to do that :( here is a hug for now 🤗");
        return console.error(err);
    });

}

exports.help = {
	name: "neko",
	description: "get a random neko from bell's homework folder",
	usage: "neko",
	example: "neko"
};
  
exports.conf = {
	aliases: [],
	cooldown: 3,
    guildOnly: true,
    userPerms: [],
    channelPerms: ["EMBED_LINKS"]
};