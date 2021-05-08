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
		let text = await sfw.catText({ text: query });
		await message.channel.stopTyping(true);
		return message.channel.send(`here! ${text.cat.toLowerCase()}`)
	} catch (error) {
		await message.channel.stopTyping(true);
		return message.channel.send('hmm, something happened when i was trying to talk like a cat lmao. maybe Discord hate it :(')
	}
},
exports.help = {
	name: "catify",
	description: "make your text or the message above yours sounds like a cat :thinking:",
	usage: "catify `[text]`",
	example: "catify `wut`"
};
  
exports.conf = {
	aliases: ['cattext'],
    cooldown: 3,
    guildOnly: true,
};