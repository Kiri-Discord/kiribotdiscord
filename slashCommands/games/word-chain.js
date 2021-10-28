const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js')
const { stripIndents } = require('common-tags');
const { buttonVerify, delay } = require('../../util/util');
const startWords = require('../../assets/word-list.json');
const { webster_key } = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction, args) => {
    const current = client.games.get(interaction.channel.id);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });

    if (client.isPlaying.get(interaction.author.id)) return interaction.reply({ content: 'you are already in a game. please finish that first.', ephemeral: true });

    const member = interaction.options.getMember('opponent');

    const opponent = member.user;
    let time = interaction.options.getInteger('timeout') || 10;
    if (client.isPlaying.get(opponent.id)) return interaction.reply({ content: 'that user is already in a game. try again in a minute.', ephemeral: true });
    if (opponent.id === interaction.user.id) return interaction.reply({ content: 'you can\'t play against yourself :(', ephemeral: true });
    if (opponent.id === client.user.id) return interaction.reply({ content: 'i really want to but i\'m busy :pensive:', ephemeral: true });
    if (opponent.bot) return interaction.reply({ content: 'since bots are too smart, i can\'t allow that :(', ephemeral: true });
    if (isNaN(time) || time > 15 || time < 3) return interaction.reply({ content: 'the waiting time should be a number in second, and it can\'t be longer than 15 seconds or shorter than 3 seconds :(', ephemeral: true });
    client.games.set(interaction.channel.id, { prompt: `please wait until **${interaction.user.username}** **${opponent.username}** finish playing their game :pensive:` });

    try {
        await interaction.deferReply();
        const verification = await buttonVerify(interaction.channel, opponent, `${opponent}, do you accept this challenge?`);
        if (!verification) {
            client.games.delete(interaction.channel.id);
            return interaction.editReply('looks like they declined...');
        };
        client.isPlaying.set(interaction.author.id, true);
        client.isPlaying.set(opponent.id, true);

        const startWord = startWords[Math.floor(Math.random() * startWords.length)];
        const embed = new MessageEmbed()
            .setTitle(`word chain: ${interaction.user.username} vs ${opponent.username}`)
            .setDescription(stripIndents `
			the start word will be **${startWord}**! you must answer within **${time}** seconds!
			
			if you think your opponent has played a word that **doesn't exist**, respond with **challenge** on your turn.
			words cannot contain anything but letters. no numbers, spaces, or hyphens may be used :(
			the game will start in 5 seconds...
		`);
        await interaction.editReply({ embeds: [embed] });
        await delay(5000);
        let userTurn = Boolean(Math.floor(Math.random() * 2));
        const words = [];
        let winner = null;
        let lastWord = startWord;
        while (!winner) {
            const player = userTurn ? interaction.user : opponent;
            const letter = lastWord.charAt(lastWord.length - 1);
            await interaction.channel.send(`it's ${player}'s turn! the letter is **${letter}**.`);
            const filter = res =>
                res.author.id === player.id && /^[a-zA-Z']+$/i.test(res.content) && res.content.length < 50;
            const wordChoice = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: time * 1000
            });
            if (!wordChoice.size) {
                await interaction.channel.send('now!');
                winner = userTurn ? opponent : interaction.user;
                break;
            };
            const choice = wordChoice.first().content.toLowerCase();
            if (choice === 'challenge') {
                const checked = await verifyWord(lastWord);
                if (!checked) {
                    await interaction.channel.send(`caught red-handed! **${lastWord}** is not valid!`);
                    winner = player;
                    break;
                };
                await interaction.channel.send(`sorry, **${lastWord}** is indeed valid!`);
                continue;
            };
            if (!choice.startsWith(letter) || words.includes(choice)) {
                await interaction.channel.send('sorry! you lose!');
                winner = userTurn ? opponent : interaction.user;
                break;
            };
            words.push(choice);
            lastWord = choice;
            userTurn = !userTurn;
        };
        client.games.delete(interaction.channel.id);
        if (!winner) return interaction.channel.send('oh... no one won.');
        const lost = winner.id === interaction.user.id ? opponent : interaction.user;
        let amount = getRandomInt(10, 25);
        await client.money.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: lost.id
        }, {
            guildId: interaction.guild.id,
            userId: lost.id,
            $inc: {
                matchPlayed: 1,
                lose: 1
            },
        }, {
            upsert: true,
            new: true,
        });
        const storageAfter = await client.money.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: winner.id
        }, {
            guildId: interaction.guild.id,
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
        return interaction.channel.send(`the game is over! the winner is ${winner}!\n⏣ __**${amount}**__ token was placed in your wallet as a reward!\ncurrent balance: \`${storageAfter.balance}\``);
    } catch (err) {
        client.games.delete(interaction.channel.id);
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
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('opponent')
            .setDescription('who would you want to be your opponent?')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('timeout')
            .setDescription('what is the answer duration that you want to give for each player? (in seconds)')
            .setRequired(false)
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};