const { MersenneTwister19937, integer } = require('random-js');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild) || message.member;
    const { user } = member;

    let level;
    if (client.config.owners.includes(message.author.id)) {
        level = 10;
    } else {
        const random = MersenneTwister19937.seed(user.id);
        level = integer(0, 10)(random);
    };
    const embed = new MessageEmbed()
    .setTitle('pp meter machine')
    .setDescription(`${user.username} peepee\n8${('=').repeat(level)}D`)
    .setColor(member.displayHexColor);
    if (level < 3) embed.setFooter(`that size is fixed to ${user.id === message.author.id ? 'your' : 'their'} DNA, running this again won't change anything ¯\\_(ツ)_/¯`)
    return message.channel.send(embed);
};



exports.help = {
	name: "pp-size",
	description: "measure your peepee",
	usage: ["pp-size `[@mention]`", "pp-size `[user ID]`"],
	example: ["pp-size `@someone`", "pp-size `8539539753795397`"]
};
  
exports.conf = {
	aliases: ["ppsize", "ratepp"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};