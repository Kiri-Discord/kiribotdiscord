const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async (client, message, args, prefix, cmd) => {
	try {
		message.channel.startTyping(true);
		let query = args.join(' ') || message.channel.messages.cache.filter(x => !x.author.bot && !x.content.startsWith(prefix + cmd) && !x.content).last().cleanContent;
		console.log(query)
		let text = await sfw.OwOify({ text: query });
		await message.channel.stopTyping(true);
		return message.channel.send(text.owo.toLowerCase())
	} catch (error) {
		await message.channel.stopTyping(true);
		return message.channel.send('hmm, something happened when i was trying to owo a lot lol. maybe Discord hate it :(')
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