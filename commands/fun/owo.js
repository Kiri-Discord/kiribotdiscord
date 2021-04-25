const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async (client, message, args) => {
	try {
		message.channel.startTyping(true);
		let query = args.join(' ');
		if (!query) {
			const messages = await message.channel.messages.fetch({ limit: 2 });
			query = messages.last().cleanContent;
		}
		let text = await sfw.OwOify({ text: query });
		await message.channel.stopTyping(true);
		return message.channel.send(text.owo.toLowerCase())
	} catch (error) {
		await message.channel.stopTyping(true);
		return message.channel.send('hmm, something happened when i was trying to talk like a cat lmao. maybe Discord hate it :(')
	}
},


exports.help = {
	name: "owo",
	description: "owo your text or the message above yours? :thinking:",
	usage: "owo `[text]`",
	example: "owo `hmmm`"
};
  
exports.conf = {
	aliases: ['owoify', 'uwu'],
    cooldown: 3,
    guildOnly: true,
};