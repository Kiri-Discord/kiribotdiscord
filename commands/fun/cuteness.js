const { MersenneTwister19937, integer } = require('random-js');
const texts = require('../../assets/cuteness');

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author;
    const authorUser = user.id === message.author.id;
    if (user.id === client.user.id) return message.channel.send('me? well you decide instead :D');
    if (user.bot) return message.reply('have you ever watched Ex Machina?');
    
    const random = MersenneTwister19937.seed(user.id);
    const cuteness = integer(0, texts.length - 1)(random);
    return message.channel.send(`i think ${authorUser ? 'you are' : `${user.username} is`} ${texts[cuteness]}`);
}


exports.help = {
	name: "cuteness",
	description: "determines a user's cuteness.",
	usage: "cuteness [@mention]",
	example: "cuteness @someone"
};
  
exports.conf = {
	aliases: ["cutemeter", "cute"],
    cooldown: 4,
    guildOnly: true
};
