const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const { Collection } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { delay, awaitPlayers, reactIfAble } = require('../../util/util');
const trueOptions = ['true', 'yes', 'the truth', 't', 'tru', 'tr', 'y', 'ye'];
const falseOptions = ['false', 'lie', 'no', 'a lie', 'f', 'fals', 'fal', 'fa', 'n', 'l'];

exports.run = async(client, interaction) => {
        let players = interaction.options.getInteger('player-count') || 1;
        if (isNaN(players) || players < 1 || players > 20) return interaction.reply({
            content: `how many players are you expecting to have? pick a number between 1 and 20 by using \`/lie-detector <number of player>\``,
            ephemeral: true
        })
        const current = client.games.get(interaction.channel.id);
        if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
        client.games.set(interaction.channel.id, { prompt: `please wait until players in this channel has finished their game :(` });
        try {
            const pts = new Collection();
            if (players > 1) {
                const message = await interaction.reply({ content: 'beginning the Among Us game...', fetchReply: true });
                const awaitedPlayers = await awaitPlayers(interaction.user.id, message, players, 2);
                awaitedPlayers.push(interaction.user.id);
                for (const player of awaitedPlayers) {
                    pts.set(player, {
                        points: 0,
                        id: player,
                        user: await client.users.fetch(player)
                    });
                };
            } else {
                pts.set(interaction.user.id, {
                    points: 0,
                    id: interaction.user.id,
                    user: interaction.user
                });
            }

            let turn = 0;
            const questions = await fetchQuestions();
            let lastTurnTimeout = false;
            while (questions.length) {
                ++turn;
                const question = questions[0];
                questions.shift();
                await interaction.channel.send(stripIndents `
				**${turn}. ${question.category.toLowerCase()}**
				${question.question.toLowerCase()}

				is it **true** or is it a **lie**?
			`);
                const filter = res => {
                    if (!pts.has(res.author.id)) return false;
                    const answer = res.content.toLowerCase();
                    if (trueOptions.includes(answer) || falseOptions.includes(answer)) {
                        reactIfAble(res, res.author, '✅');
                        return true;
                    }
                    return false;
                };
                const messages = await interaction.channel.awaitMessages({
                    filter,
                    max: pts.size,
                    time: 30000
                });
                if (!messages.size) {
                    if (players > 1) {
                        await interaction.channel.send(`no answers? well, it was ${question.answer ? 'true' : 'a lie'}.`);
                        if (lastTurnTimeout) {
                            break;
                        } else {
                            lastTurnTimeout = true;
                            continue;
                        }
                    } else {
                        interaction.channel.send(`no answers? well, it was ${question.answer ? 'true' : 'a lie'}.\nthe game has been ended since you are the only player!`);
                        break;
                    }
                }
                const answers = messages.map(res => {
                    let answer;
                    if (trueOptions.includes(res.content.toLowerCase())) answer = true;
                    else if (falseOptions.includes(res.content.toLowerCase())) answer = false;
                    return { answer, id: res.author.id };
                });
                const correct = answers.filter(answer => answer.answer === question.answer);
                for (const answer of correct) {
                    const player = pts.get(answer.id);
                    if (correct[0].id === answer.id) player.points += 75;
                    else player.points += 50;
                }
                await interaction.channel.send(stripIndents `
				it was... **${question.answer ? 'true' : 'a lie'}**!
				fastest guess was: ${correct.length ? `${pts.get(correct[0].id).user.username} (+75 pts)` : 'no one...'}

				${questions.length ? '_5 seconds into the next round..._' : ''}
			`);
			if (lastTurnTimeout) lastTurnTimeout = false;
			if (questions.length) await delay(5000);
		}
		client.games.delete(interaction.channel.id);
		const winner = pts.sort((a, b) => b.points - a.points).first().user;
		return interaction.channel.send(stripIndents`
			congrats, ${winner}!
			__**top 10 players:**__
			${makeLeaderboard(pts).slice(0, 10).join('\n')}
		`);
	} catch (err) {
		client.games.delete(interaction.channel.id);
		throw err;
	}
}
async function fetchQuestions() {
	const { body } = await request
		.get('https://opentdb.com/api.php')
		.query({
			amount: 7,
			type: 'boolean',
			encode: 'url3986'
		});
	if (!body.results) return fetchQuestions();
	const questions = body.results;
	return questions.map(question => {
		const answer = question.correct_answer === 'true';
		return {
			question: decodeURIComponent(question.question),
			category: decodeURIComponent(question.category),
			answer
		};
	});
}

function makeLeaderboard(pts) {
	let i = 0;
	let previousPts = null;
	let positionsMoved = 1;
	return pts
		.sort((a, b) => b.points - a.points)
		.map(player => {
			if (previousPts === player.points) {
				positionsMoved++;
			} else {
				i += positionsMoved;
				positionsMoved = 1;
			}
			previousPts = player.points;
			return `**${i}.** ${player.user.username} (${player.points} point${player.points === 1 ? '' : 's'})`;
		});
};


exports.help = {
	name: "lie-guess",
	description: "you and your opponent will be given a fact and must quickly decide if it\'s true or a **lie.¯\\_(ツ)_/¯",
	usage: ["lie-guess `<number of players>`"],
	example: ["lie-guess `4`"]
};
  
exports.conf = {
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description)
    .addIntegerOption(option => option
        .setName('player-count')
        .setDescription('how many players that you want to have?')
        .setRequired(true)
    ),
    cooldown: 5,
	guildOnly: true,
};