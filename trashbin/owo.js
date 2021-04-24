const neko = require('nekos.life');
const { sfw } = new neko();




exports.help = {
	name: "joke",
	description: "gives you a random joke",
	usage: "joke",
	example: "joke"
};
  
exports.conf = {
	aliases: [],
    cooldown: 3,
    guildOnly: true,
};