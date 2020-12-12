const { delay, verify } = require('../../util/util');

exports.run = async (client, message, args) => {
	const opponent = message.mentions.users.first();
	if (!opponent) return message.reply('what user would you like to challenge? tag them after the command!');
	if (opponent.id === message.author.id) return message.reply('you may not play against yourself.');
	if (opponent.bot) return message.reply('you can\'t spam with bot! well technically you can, but..');
	if (opponent.id === client.user.id) return message.reply('me? nah i\'m busy :(');
	
	const current = client.games.get(message.channel.id);
	if (current) return message.reply(current.prompt);
	client.games.set(message.channel.id, { prompt: `you should wait until **${message.author.username}** and **${opponent.username}** stop spamming :)` });
	try {
		await message.channel.send(`${opponent}, do you accept this challenge? \`y/n\``);
		const verification = await verify(message.channel, opponent);
		if (!verification) {
			client.games.delete(message.channel.id);
			return message.channel.send('looks like they declined...');
		}
		await message.channel.send('you get one point per character in your messages. you get 20 seconds to spam.');
		await delay(5000);
		await message.channel.send('you have **20 seconds** to spam. go!');
		const msgs = await message.channel.awaitMessages(res => [opponent.id, message.author.id].includes(res.author.id), {
			time: 20000
		});
		const authorMsgs = msgs
			.filter(authorMsg => authorMsg.author.id === message.author.id)
			.reduce((a, b) => a + b.content.length, 0);
		const opponentMsgs = msgs
			.filter(opponentMsg => opponentMsg.author.id === opponent.id)
			.reduce((a, b) => a + b.content.length, 0);
		const winner = authorMsgs > opponentMsgs ? message.author : opponent;
		const winnerPts = authorMsgs > opponentMsgs ? authorMsgs : opponentMsgs;
		const loserPts = authorMsgs > opponentMsgs ? opponentMsgs : authorMsgs;
		client.games.delete(message.channel.id);
		if (authorMsgs === opponentMsgs) {
			return message.channel.send(`it was a tie! you both got **${winnerPts}** points! for *spamming*`);
		}
		return message.channel.send(`the winner is ${winner}, with **${winnerPts}** points! your opponent only got ${loserPts} :(`);
	} catch (err) {
		client.games.delete(message.channel.id);
		throw err;
	}
}

exports.help = {
	name: "spam-fight",
	description: "challange a player to spam ¯\_(ツ)_/¯",
	usage: "spam-fight <@mention>",
	example: "spam-fight @kuru"
};
  
exports.conf = {
	aliases: ["spam-battle", "spam"],
    cooldown: 5,
	guildOnly: true,
	userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};
