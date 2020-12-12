const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const { delay, verify } = require('../../util/util');
const startWords = require('../../assets/word-list.json');
const { webster_key } = process.env;


exports.help = {
	name: "word-chain",
	description: "try to come up with words that start with the last letter of your opponent\'s word :)",
	usage: ["word-chain `<@mention> [answer-second]`", "word-chain `<@mention>`"],
	example: ["word-chain `@bell 10`", "word-chain `@bell`"],
};
  
exports.conf = {
	aliases: ["wordchain"],
    cooldown: 5,
	guildOnly: true,
	userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};

exports.run = async (client, message, args) => {
	const current = client.games.get(message.channel.id);
	if (current) return message.reply(current.prompt);
	const opponent = message.mentions.users.first();
	const time = args[1] || 10;
	if (isNaN(time) || time > 15 || time < 3 ) return message.reply('the waiting time should be a number in second, and it can\'t be longer than 15 seconds or shorter than 3 seconds :(')
	if (!opponent) return message.reply('you should tag someone to play :(')
	if (opponent.bot) return message.reply('since bots are too smart, i couldn\'t allow that :(');
	if (opponent.id === message.author.id) return message.reply('you can\'t play against yourself :(');
	client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** **${opponent.username}** finished playing :(` });

	try {
		await message.channel.send(`${opponent}, do you accept this challenge? \`y/n\``);
		const verification = await verify(message.channel, opponent);
		if (!verification) {
			client.games.delete(message.channel.id);
			return message.reply('looks like they declined...');
		}
		const startWord = startWords[Math.floor(Math.random() * startWords.length)];
		await message.channel.send(stripIndents`
			the start word will be **${startWord}**! you must answer within **${time}** seconds!
			if you think your opponent has played a word that doesn't exist, respond with **challenge** on your turn.
			words cannot contain anything but letters. no numbers, spaces, or hyphens may be used :(
			the game will start in 5 seconds...
		`);
		await delay(5000);
		let userTurn = Boolean(Math.floor(Math.random() * 2));
		const words = [];
		let winner = null;
		let lastWord = startWord;
		while (!winner) {
			const player = userTurn ? message.author : opponent;
			const letter = lastWord.charAt(lastWord.length - 1);
			await message.channel.send(`it's ${player}'s turn! the letter is **${letter}**.`);
			const filter = res =>
				res.author.id === player.id && /^[a-zA-Z']+$/i.test(res.content) && res.content.length < 50;
			const wordChoice = await message.channel.awaitMessages(filter, {
				max: 1,
				time: time * 1000
			});
			if (!wordChoice.size) {
				await message.channel.send('now!');
				winner = userTurn ? opponent : message.author;
				break;
			}
			const choice = wordChoice.first().content.toLowerCase();
			if (choice === 'challenge') {
				const checked = await verifyWord(lastWord);
				if (!checked) {
					await message.channel.send(`caught red-handed! **${lastWord}** is not valid!`);
					winner = player;
					break;
				}
				await message.channel.send(`sorry, **${lastWord}** is indeed valid!`);
				continue;
			}
			if (!choice.startsWith(letter) || words.includes(choice)) {
				await message.channel.send('sorry! you lose!');
				winner = userTurn ? opponent : message.author;
				break;
			}
			words.push(choice);
			lastWord = choice;
			userTurn = !userTurn;
		}
		client.games.delete(message.channel.id);
		if (!winner) return message.channel.send('oh... no one won.');
		return message.channel.send(`the game is over! the winner is ${winner}!`);
	} catch (err) {
		client.games.delete(message.channel.id);
		console.log(err)
	}
}

async function verifyWord(word) {
	if (startWords.includes(word.toLowerCase())) return true;
	try {
		const { body } = await request
			.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}`)
			.query({ key: webster_key });
		if (!body.length) return false;
		return true;
	} catch (err) {
		if (err.status === 404) return false;
		return null;
	}
}



