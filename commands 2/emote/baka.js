const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async (client, message, args) => {
    const data = await sfw.baka();
    const embed = new MessageEmbed()
	.setColor('RANDOM')
    .setAuthor(`${message.author.username} just tell someone stupid 😕`, message.author.displayAvatarURL())
    .setImage(data.url)
    return message.channel.send(embed);

}
exports.help = {
    name: "baka",
    description: "give a stupid presence to everyone :confused:",
    usage: "baka",
    example: "baka"
};

exports.conf = {
    aliases: ['defy'],
    cooldown: 3,
    guildOnly: true,
    
	channelPerms: ["EMBED_LINKS"]
};