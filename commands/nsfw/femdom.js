//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
const { MessageEmbed } = require("discord.js");
exports.run = async (client, message, args) => {
    const stare = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':thinking:';
    const data = await nsfw.femdom()
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setDescription(`still powered by bell's homework folder but.. ${stare}`)
    .setImage(data.url);
    return message.channel.send(embed);
}
exports.help = {
	name: "femdom",
	description: "send some nsfw femdom from bell's homework folder :cry:",
	usage: "femdom",
	example: "femdom"
};
  
exports.conf = {
	aliases: [],
    cooldown: 3,
    guildOnly: true,
	adult: true,
    
	channelPerms: ["EMBED_LINKS"]
};