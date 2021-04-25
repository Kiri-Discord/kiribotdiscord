const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async (client, message, args, prefix, cmd) => {
	try {
		message.channel.startTyping(true);
		let query = args.join(' ') || message.channel.messages.cache.filter(x => !x.author.bot && !x.content.startsWith(prefix + cmd) && !x.content).last().cleanContent;
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