const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js')
const { stripIndents } = require('common-tags');
const { buttonVerify, delay } = require('../../util/util');
const startWords = require('../../assets/word-list.json');
const { webster_key } = require('../../config.json');

exports.run = async(client, message, args) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(current.prompt);
    if (client.isPlaying.get(message.author.id)) return message.reply('you are already in a game. please finish that first.');
    const member = client.utils.parseMember(message, args[0])
    if (!member) return message.reply('you should tag someone to play with :(');
    const opponent = member.user;
    let time = args[1] || 10;
    if (client.isPlaying.get(opponent.id)) return message.reply('that user is already in a game. try again in a minute.');
    if (opponent.id === message.author.id) return message.reply('you can\'t play against yourself :(');
    if (opponent.id === client.user.id) return message.reply('i really want to but i\'m busy :pensive:');
    if (opponent.bot) return message.reply('since bots are too smart, i can\'t allow that :(');
    if (isNaN(time) || time > 15 || time < 3) return message.reply('the waiting time should be a number in second, and it can\'t be longer than 15 seconds or shorter than 3 seconds :(');
    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** **${opponent.username}** finish playing their game :pensive:` });

    try {
        const verification = await buttonVerify(message.channel, opponent, `${opponent}, do you accept this challenge?`);
        if (!verification) {
            client.games.delete(message.channel.id);
            return message.channel.send('looks like they declined...');
        };
        client.isPlaying.set(message.author.id, true);
        client.isPlaying.set(opponent.id, true);
        time = parseInt(time);
        const startWord = startWords[Math.floor(Math.random() * startWords.length)];
        const embed = new MessageEmbed()
            .setTitle(`word chain: ${message.author.username} vs ${opponent.username}`)
            .setDescription(stripIndents `
			the start word will be **${startWord}**! you must answer within **${time}** seconds!
			
			if you think your opponent has played a word that **doesn't exist**, respond with **challenge** on your turn.
			words cannot contain anything but letters. no numbers, spaces, or hyphens may be used :(
			the game will start in 5 seconds...
		`);
        await message.channel.send({ embeds: [embed] });
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
            const wordChoice = await message.channel.awaitMessages({
                filter,
                max: 1,
                time: time * 1000
            });
            if (!wordChoice.size) {
                await message.channel.send('now!');
                winner = userTurn ? opponent : message.author;
                break;
            };
            const choice = wordChoice.first().content.toLowerCase();
            if (choice === 'challenge') {
                const checked = await verifyWord(lastWord);
                if (!checked) {
                    await message.channel.send(`caught red-handed! **${lastWord}** is not valid!`);
                    winner = player;
                    break;
                };
                await message.channel.send(`sorry, **${lastWord}** is indeed valid!`);
                continue;
            };
            if (!choice.startsWith(letter) || words.includes(choice)) {
                await message.channel.send('sorry! you lose!');
                winner = userTurn ? opponent : message.author;
                break;
            };
            words.push(choice);
            lastWord = choice;
            userTurn = !userTurn;
        };
        client.games.delete(message.channel.id);
        client.isPlaying.delete(message.author.id);
        client.isPlaying.delete(opponent.id);
        if (!winner) return message.channel.send('oh... no one won.');
        const lost = winner.id === message.author.id ? opponent : message.author;
        let amount = getRandomInt(10, 25);
        await client.db.money.findOneAndUpdate({
            guildId: message.guild.id,
            userId: lost.id
        }, {
            guildId: message.guild.id,
            userId: lost.id,
            $inc: {
                matchPlayed: 1,
                lose: 1
            },
        }, {
            upsert: true,
            new: true,
        });
        const storageAfter = await client.db.money.findOneAndUpdate({
            guildId: message.guild.id,
            userId: winner.id
        }, {
            guildId: message.guild.id,
            userId: winner.id,
            $inc: {
                balance: amount,
                matchPlayed: 1,
                win: 1
            },
        }, {
            upsert: true,
            new: true,
        });
        return message.channel.send(`the game is over! the winner is ${winner}!\n⏣ __**${amount}**__ token was placed in your wallet as a reward!\ncurrent balance: \`${storageAfter.balance}\``);
    } catch (err) {
        client.isPlaying.delete(message.author.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(message.channel.id);
        logger.log('error', err);
    };
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


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
    };
};
exports.help = {
    name: "word-chain",
    description: "try to come up with words that start with the last letter of your opponent\'s word :)",
    usage: ["word-chain `<@mention> [timeout]`", "word-chain `<@mention>`"],
    example: ["word-chain `@bell 10`", "word-chain `@bell`"],
};

exports.conf = {
    aliases: ["wordchain"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};