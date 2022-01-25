const Battle = require('../../features/battle/battle');
const { randomRange, buttonVerify } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('opponent') || interaction.guild.me;
    const opponent = member.user;
    if (opponent.id === interaction.user.id) return interaction.reply({ content: 'you can\'t play against yourself :(', ephemeral: true });
    const current = client.games.get(interaction.channel.id);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
    if (client.isPlaying.get(interaction.user.id)) return interaction.reply({ content: 'you are already in a game. please finish that first.', ephemeral: true });
    client.games.set(interaction.channel.id, { data: new Battle(interaction.user, opponent), prompt: `you should wait until **${interaction.user.username}** and **${opponent.username}** finish fighting :)` });
    try {
        client.isPlaying.set(interaction.user.id, true);
        if (!opponent.bot) {
            if (client.isPlaying.get(opponent.id)) {
                client.isPlaying.delete(interaction.user.id);
                client.games.delete(interaction.channel.id);
                return interaction.reply({ content: 'that user is already in a game. try again in a minute.', ephemeral: true });
            };
            await interaction.deferReply();
            const verification = await buttonVerify(interaction.channel, opponent, `${opponent}, do you accept this challenge?`);
            if (!verification) {
                client.isPlaying.delete(interaction.user.id);
                client.games.delete(interaction.channel.id);
                return interaction.editReply({ content: 'looks like they declined :pensive:' });
            } else {
                interaction.editReply({ content: 'beginning the battle...' });
            };
            client.isPlaying.set(opponent.id, true);
        } else {
            interaction.reply({ content: 'beginning the battle...', ephemeral: true });
        };
        const battle = client.games.get(interaction.channel.id).data;
        while (!battle.winner) {
            const choice = await battle.attacker.chooseAction(interaction.channel);
            if (choice === 'attack') {
                const damage = randomRange(battle.defender.guard ? 5 : 20, battle.defender.guard ? 20 : 50);
                await interaction.channel.send(`${battle.attacker} deals **${damage}** damage!`);
                battle.defender.dealDamage(damage);
                battle.reset();
            } else if (choice === 'defend') {
                await interaction.channel.send(`${battle.attacker} defends!`);
                battle.attacker.changeGuard();
                battle.reset(false);
            } else if (choice === 'special') {
                const miss = Math.floor(Math.random() * 5);
                if (miss === 0 || miss === 3) {
                    await interaction.channel.send(`${battle.attacker}'s special attack missed!`);
                } else if (miss === 1 || miss === 5) {
                    const damage = randomRange(battle.defender.guard ? 10 : 40, battle.defender.guard ? 40 : 100);
                    await interaction.channel.send(`${battle.attacker}'s special attack grazed the opponent, dealing **${damage}** damage!`);
                    battle.defender.dealDamage(damage);
                } else if (miss === 2) {
                    const damage = randomRange(battle.defender.guard ? 20 : 80, battle.defender.guard ? 80 : 200);
                    await interaction.channel.send(`${battle.attacker}'s special attack hit directly, dealing **${damage}** damage!`);
                    battle.defender.dealDamage(damage);
                }
                battle.attacker.useMP(25);
                battle.reset();
            } else if (choice === 'cure') {
                const amount = Math.round(battle.attacker.mp / 2);
                await interaction.channel.send(`${battle.attacker} heals **${amount}** HP!`);
                battle.attacker.heal(amount);
                battle.attacker.useMP(battle.attacker.mp);
                battle.reset();
            } else if (choice === 'final') {
                await interaction.channel.send(`${battle.attacker} uses their final move, dealing **100** damage!`);
                battle.defender.dealDamage(100);
                battle.attacker.useMP(50);
                battle.attacker.usedFinal = true;
                battle.reset();
            } else if (choice === 'run') {
                await interaction.channel.send(`${battle.attacker} flees!`);
                battle.attacker.forfeit();
            } else if (choice === 'failed:time') {
                await interaction.channel.send(`time's up, ${battle.attacker}!`);
                battle.reset();
                if (battle.lastTurnTimeout) {
                    battle.endedDueToInactivity = true;
                    break;
                } else {
                    battle.lastTurnTimeout = true;
                }
            } else {
                await interaction.channel.send('i do not understand what you want me to do :(');
            }
            if (choice !== 'failed:time' && battle.lastTurnTimeout) battle.lastTurnTimeout = false;
        };
        client.isPlaying.delete(interaction.user.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(interaction.channel.id);
        if (battle.winner === 'time') return interaction.channel.send('i ended the game since there was no activity :pensive:');
        const winner = interaction.guild.members.cache.get(battle.winner.toString().replace(/[<>@!]/g, "")).user;
        const lost = winner.id === interaction.user.id ? opponent : interaction.user;
        if (!lost.bot) {
            await client.db.money.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: lost.id
            }, {
                guildId: interaction.guild.id,
                userId: lost.id,
                $inc: {
                    matchPlayed: 1,
                    lose: 1,
                },
            }, {
                upsert: true,
                new: true,
            });
        };
        if (!winner.bot) {
            let amount = getRandomInt(10, 25);
            const storageAfter = await client.db.money.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: winner.id
            }, {
                guildId: interaction.guild.id,
                userId: winner.id,
                $inc: {
                    matchPlayed: 1,
                    win: 1,
                    balance: amount
                },
            }, {
                upsert: true,
                new: true,
            });
            return interaction.channel.send(`the match is over! congrats, ${winner} !\n\n⏣ __**${amount}**__ token was placed in your wallet as a reward!\ncurrent balance: \`${storageAfter.balance}\``);
        } else {
            return interaction.channel.send(`the match is over! congrats, ${winner}!`);
        }
    } catch (err) {
        client.isPlaying.delete(interaction.user.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(interaction.channel.id);
        throw err;
    };
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.help = {
    name: "battle",
    description: "engage in a turn-based battle against another user or me!",
    usage: ["battle `<@mention>`"],
    example: ["battle `@bell`"]
};

exports.conf = {
    cooldown: 6,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('opponent')
            .setDescription('who would you want to be your opponent? leaving it blank will revert back to me.')
            .setRequired(false)
        )
};