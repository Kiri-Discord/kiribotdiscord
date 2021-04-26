//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
const { MessageEmbed } = require("discord.js");
exports.run = async (client, message, args) => {
    let data;
    const stare = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':thinking:';
    const choices = ["1", "2", "3"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === '1') data = await nsfw.feet()
    else if (choice === '2') data = await nsfw.feetGif()
    else data = await nsfw.eroFeet()
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setDescription(`still powered by bell's homework folder but.. ${stare}`)
    .setImage(data.url);
    return message.channel.send(embed);
}
exports.help = {
	name: "feet",
	description: "send some nsfw feet from bell's homework folder :cry:",
	usage: "feet",
	example: "feet"
};
  
exports.conf = {
	aliases: [],
    cooldown: 3,
    guildOnly: true,
	adult: true,
    
	channelPerms: ["EMBED_LINKS"]
};