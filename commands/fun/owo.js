const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async (client, message, args, prefix) => {
	try {
		message.channel.startTyping(true);
		let query = args.join(' ');
		if (!query) {
			const cache = message.channel.messages.cache.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
			if (!cache) {
				const messages = await message.channel.messages.fetch({ limit: 5 });
				query = messages.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last().cleanContent;
			} else query = cache.cleanContent;
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