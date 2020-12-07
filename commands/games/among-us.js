const words = require('../../assets/imposter.json');
const { stripIndents, oneLine } = require('common-tags');
const Collection = require('@discordjs/collection');
const { delay, awaitPlayers, list } = require('../../util/util');



exports.run = async (client, message, args) => {
    let playersCount = args[0];
    if (!playersCount|| playersCount < 3 || playersCount > 20) return message.channel.send('how many players are you expecting to have? pick a number between 3 and 20.')
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(`please wait until the current game of **${current.name}** is finished :(`);
    client.games.set(message.channel.id, { name: 'Among Us' });
    try {
        const awaitedPlayers = await awaitPlayers(message, playersCount, 3);
        if (!awaitedPlayers) {
            client.games.delete(message.channel.id);
            return message.channel.send('game could not be started...');
        }
        const word = words[Math.floor(Math.random() * words.length)];
        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
        const players = new Collection();
        const imposter = awaitedPlayers[Math.floor(Math.random() * awaitedPlayers.length)];
        await message.channel.send(oneLine`
            welcome to **among us**! in this game, you will have to figure out who the imposter is!
            all you have to do is watch what other players say in 4 minutes. there's a special word called a kill word, which is sent to your DM!
            only the imposter can say it, and if anyone else does, they die! to win, figure out what the kill
            word is, and try to catch the imposter saying it. as for the imposter, you know the word, try to get
            everyone to say it!
        `);
        for (const player of awaitedPlayers) {
            players.set(player, {
                id: player,
                user: await client.users.fetch(player),
                killed: false,
                imposter: imposter === player
            });
            const newPlayer = players.get(player);
            if (imposter === player) newPlayer.user.send(`you are the **imposter**. the kill word is ${word}.`).catch(async () => {
                await client.games.delete(message.channel.id);
                return message.channel.send('i failled while sending the DM :( enable everyone\'s DM then start the game again!');
            });
            else newPlayer.user.send('you are not the imposter. be careful what you say!').catch(async () => {
                await client.games.delete(message.channel.id);
                return message.channel.send('i failled while sending the DM :( enable everyone\'s DM then start the game again!');
            });
        }
        let lastTurnTimeout = false;
        const winners = [];
        while (players.filter(player => !player.killed).size > 2) {
            const playersLeft = players.filter(player => !player.killed).size;
            await message.channel.send(`there are **${playersLeft}** players remaining. talk until someone says the kill word.`);
            const filter = res => {
                const player = players.get(res.author.id);
                if (!player || player.killed || player.imposter) return false;
                if (res.content && wordRegex.test(res.content)) return true;
                return false;
            };
            const msgs = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 240000
            });
            if (msgs.size) {
                const killedMsg = msgs.first();
                try {
                    await killedMsg.react('🔪');
                } catch {
                    await killedMsg.reply('🔪');
                }
                players.get(killedMsg.author.id).killed = true;
                await message.channel.send(stripIndents`
                    ${killedMsg.author} has been murdered for saying the kill word!
                    talk amongst yourselves, who is the imposter? voting begins in 1 minute.
                `);
            } else {
                await message.channel.send(stripIndents`
                    no one has said the word for 4 minutes. we're voting anyway! who looks suspicious?
                    talk amongst yourselves, who is the imposter? voting begins in 1 minute.
                `);
            }
            await delay(60000);
            const choices = players.filter(player => !player.killed);
            const ids = choices.map(player => player.id);
            let i = 0;
            await message.channel.send(stripIndents`
                alright, who do you think the imposter is? you have 1 minute to vote.

                _type the number of the player you think is the imposter._
                ${choices.map(player => { i++; return `**${i}.** ${player.user.tag}`; }).join('\n')}
            `);
            const votes = new Collection();
            const voteFilter = res => {
                const player = players.get(res.author.id);
                if (!player || player.killed) return false;
                const int = Number.parseInt(res.content, 10);
                if (int >= 1 && int <= players.filter(p => !p.killed).size) {
                    const currentVotes = votes.get(choices[int - 1]);
                    votes.set(ids[int - 1], {
                        votes: currentVotes ? currentVotes + 1 : 1,
                        id: ids[int - 1]
                    });
                    res.react('✅').catch(() => null);
                    return true;
                }
                return false;
            };
            const vote = await message.channel.awaitMessages(voteFilter, {
                max: players.filter(player => !player.killed).size,
                time: 60000
            });
            if (!vote.size) {
                if (lastTurnTimeout) {
                    await message.channel.send('game ended due to inactivity.');
                    break;
                } else {
                    await message.channel.send('come on guys, get in the game!');
                    lastTurnTimeout = true;
                    continue;
                }
            }
            const kicked = players.get(votes.sort((a, b) => b.votes - a.votes).first().id);
            players.get(kicked.id).killed = true;
            if (kicked.id === players.find(player => player.imposter).id) {
                await message.channel.send(`**${kicked.user.tag}** was the imposter.`);
                winners.push(...players.filter(player => !player.killed).map(player => player.user.tag));
                break;
            }
            const amountLeft = players.filter(player => !player.killed);
            await message.channel.send(stripIndents`
                **${kicked.user.tag}** was not the imposter.

                ${amountLeft.size > 2 ? '_next round starts in 30 seconds._' : ''}
            `);
            if (amountLeft.size > 2) {
                await delay(30000);
            } else {
                winners.push(players.find(player => player.imposter).user.tag);
                break;
            }
        }
        client.games.delete(message.channel.id);
        return message.channel.send(`congrats, ${list(winners)}! the kill word was **${word}**.`);
    } catch (error) {
        return;
    }
}

exports.help = {
	name: "among-us",
	description: "who is the imposter among us?",
	usage: "among-us <number of players>",
	example: "among-us 4"
};
  
exports.conf = {
	aliases: ["imposter", "amongus"],
    cooldown: 10,
    guildOnly: true
};
