const { MessageEmbed } = require('discord.js');
const randomanime = require("random-anime");
const generate = require('japanese-name-generator');

exports.run = async (client, message, args, prefix) => {
	const party = client.customEmojis.get('party') ? client.customEmojis.get('party') : ':tada:';
	const data = randomanime.anime();
	const waifu = generate({ gender: 'female' })
    const embed = new MessageEmbed()
	.setColor('RANDOM')
	.setDescription(`say hello to ${waifu.name} ${party}`)
	.setFooter(`consider using her name and image in ${prefix}waifubattle!`)
    .setImage(data)

    return message.channel.send(embed);
}

exports.help = {
	name: "waifu",
	description: "get a random waifu! consider using this as your new waifu in waifubattle!",
	usage: "waifu",
	example: "waifu"
};
  
exports.conf = {
	aliases: [],
	cooldown: 3,
    guildOnly: true,
    
    channelPerms: ["EMBED_LINKS"]
};