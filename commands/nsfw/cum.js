//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
const { MessageEmbed } = require("discord.js");
exports.run = async (client, message, args) => {
    const stare = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':thinking:';
    const choices = ["1", "2"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const data = choice === '1' ? await nsfw.cumsluts() : await nsfw.cumArts();
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setDescription(`still powered by bell's homework folder but.. ${stare}`)
    .setImage(data.url);
    return message.channel.send(embed);
}
exports.help = {
	name: "cum",
	description: "send some nsfw cum from bell's homework folder :cry:",
	usage: "cum",
	example: "cum"
};
  
exports.conf = {
	aliases: ['cumsluts'],
    cooldown: 3,
    guildOnly: true,
	adult: true,
    
	channelPerms: ["EMBED_LINKS"]
};