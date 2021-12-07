const words = require('../../assets/imposter.json');
const { stripIndents, oneLine } = require('common-tags');
const { delay, awaitPlayers, list } = require('../../util/util');
const { MessageEmbed, Collection } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
        let playersCount = interaction.options.getInteger('player-count');
        if (isNaN(playersCount) || playersCount < 3 || playersCount > 20) return interaction.reply({
            content: `how many players are you expecting to have? pick a number between 3 and 20 by using \`/among-us <number of player>\``,
            ephemeral: true
        });
        const current = client.games.get(interaction.channel.id);
        if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
        client.games.set(interaction.channel.id, { prompt: `please wait until the ongoing Among Us game is finished :(` });
        try {
            const message = await interaction.reply({ content: 'beginning the Among Us game...', fetchReply: true });
            const awaitedPlayers = await awaitPlayers(interaction.user.id, message, playersCount, 3);
            if (!awaitedPlayers.length) {
                client.games.delete(interaction.channel.id);
                return interaction.channel.send('game could not be started...');
            };
            awaitedPlayers.push(interaction.user.id);
            const word = words[Math.floor(Math.random() * words.length)];
            const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
            const players = new Collection();
            const imposter = awaitedPlayers[Math.floor(Math.random() * awaitedPlayers.length)];
            const embed = new MessageEmbed()
                .setTitle('welcome to Among Us!')
                .setDescription(oneLine `
                in this game, you will have to figure out who the imposter is!

                all you have to do is watch what other players say in 4 minutes. 
                there's a special word called a **kill word**, which is sent to the imposter's DM!
                only the **imposter** can say it, and if anyone else does, they **die**!
                to win, figure out what the kill word is, and try to catch the imposter saying it. 
                
                as for the imposter, you know the word, try to get everyone to say it!
                `)
            await interaction.channel.send({ embeds: [embed] });
            for (const player of awaitedPlayers) {
                players.set(player, {
                    id: player,
                    user: await client.users.fetch(player),
                    killed: false,
                    imposter: imposter === player
                });
                const newPlayer = players.get(player);
                try {
                    if (imposter === player) newPlayer.user.send(`you are the **imposter**. the kill word is **${word}**.`);
                    else newPlayer.user.send('you are not the imposter. be careful what you say!')
                } catch (error) {
                    await client.games.delete(interaction.channel.id);
                    return interaction.channel.send('i failled while sending the DM :( enable everyone\'s DM then start the game again!');
                };
            }
            let lastTurnTimeout = false;
            const winners = [];
            while (players.filter(player => !player.killed).size > 2) {
                const playersLeft = players.filter(player => !player.killed).size;
                await interaction.channel.send(`there are **${playersLeft}** players remaining. talk until someone says the kill word.`);
                const filter = res => {
                    const player = players.get(res.author.id);
                    if (!player || player.killed || player.imposter) return false;
                    if (res.content && wordRegex.test(res.content)) return true;
                    return false;
                };
                const msgs = await interaction.channel.awaitMessages({
                    filter,
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
                    await interaction.channel.send(stripIndents `
                    ${killedMsg.author} has been murdered for saying the kill word!
                    talk amongst yourselves, who is the imposter? voting begins in 1 minute.
                `);
                } else {
                    await interaction.channel.send(stripIndents `
                    no one has said the word for 4 minutes. we're voting anyway! who looks suspicious?
                    talk amongst yourselves, who is the imposter? voting begins in 1 minute.
                `);
                }
                await delay(60000);
                const choices = players.filter(player => !player.killed);
                const ids = choices.map(player => player.id);
                let i = 0;
                await interaction.channel.send(stripIndents `
                alright, who do you think the imposter is? you have 1 minute to vote.

                _type the number of the player you think is the imposter._
                ${choices.map(player => { i++; return `\`${i}\` ${player.user.tag}`; }).join('\n')}
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
            const vote = await interaction.channel.awaitMessages({
                filter: voteFilter,
                max: players.filter(player => !player.killed).size,
                time: 60000
            });
            if (!vote.size) {
                if (lastTurnTimeout) {
                    await interaction.channel.send('game ended due to inactivity.');
                    break;
                } else {
                    await interaction.channel.send('come on guys, get in the game!');
                    lastTurnTimeout = true;
                    continue;
                }
            }
            const kicked = players.get(votes.sort((a, b) => b.votes - a.votes).first().id);
            players.get(kicked.id).killed = true;
            if (kicked.id === players.find(player => player.imposter).id) {
                await interaction.channel.send(`**${kicked.user.tag}** was the imposter.`);
                winners.push(...players.filter(player => !player.killed).map(player => player.user.tag));
                break;
            };
            const amountLeft = players.filter(player => !player.killed);
            await interaction.channel.send(stripIndents`
                **${kicked.user.tag}** was not the imposter.

                ${amountLeft.size > 2 ? '_next round starts in 30 seconds._' : ''}
            `);
            if (amountLeft.size > 2) {
                await delay(30000);
            } else {
                winners.push(players.find(player => player.imposter).user.tag);
                break;
            };
        };
        client.games.delete(interaction.channel.id);
        if (!lastTurnTimeout) return interaction.channel.send(`congrats, ${list(winners)}! the kill word was **${word}**.`);
    } catch (error) {
        return;
    };
};

exports.help = {
	name: "among-us",
	description: "who is the imposter among us?",
	usage: ["among-us `<number of players>`"],
	example: ["among-us `4`"]
};
  
exports.conf = {
    cooldown: 6,
    guildOnly: true,
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description)
    .addIntegerOption(option => option
        .setName('player-count')
        .setDescription('how many players that you want to have?')
        .setRequired(true)
    ),
	channelPerms: ["ADD_REACTIONS", "EMBED_LINKS"]
};