const { MersenneTwister19937, integer } = require('random-js');
const texts = require('../../assets/cuteness');

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author;
    const authorUser = user.id === message.author.id;
    if (user.bot) return message.reply('have you ever watched Ex Machina?');
    if (user.id === client.user.id) return message.channel.send('me? well you decide instead :D');
    const random = MersenneTwister19937.seed(user.id);
    const cuteness = integer(0, texts.length - 1)(random);
    return message.channel.send(`${authorUser ? 'you are' : `**${user.username}** is`} ${texts[cuteness]}\n||*hey, coco didn't made those texts, its actually me saying it :)*||`);
}


exports.help = {
	name: "cuteness",
	description: "determines a user's cuteness.",
	usage: "cuteness <@mention>",
	example: "cuteness @someone"
};
  
exports.conf = {
	aliases: ["cutemeter", "cute"],
    cooldown: 4,
    guildOnly: true
};
