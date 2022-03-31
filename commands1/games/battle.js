const Battle = require('../../features/battle/battle');
const { randomRange, buttonVerify } = require('../../util/util');


exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0]) || message.guild.me;
    const opponent = member.user;
    if (opponent.id === message.author.id) return message.reply('you can\'t play against yourself :(');
    const gameId = message.channel.id;
    const current = client.games.get(gameId);
    if (current) return message.reply(current.prompt);
    if (client.isPlaying.get(message.author.id)) return message.reply('you are already in a game. please finish that first.');
    client.games.set(gameId, { data: new Battle(message.author, opponent), prompt: `you should wait until **${message.author.username}** and **${opponent.username}** finish fighting :)` });
    try {
        client.isPlaying.set(message.author.id, true);
        if (!opponent.bot) {
            if (client.isPlaying.get(opponent.id)) {
                client.isPlaying.delete(message.author.id);
                client.games.delete(gameId);
                return message.reply('that user is already in a game. try again in a minute.');
            };
            const verification = await buttonVerify(message.channel, opponent, `${opponent}, do you accept this challenge?`);
            if (!verification) {
                client.isPlaying.delete(message.author.id);
                client.games.delete(gameId);
                return message.reply('looks like they declined :pensive:');
            };
            client.isPlaying.set(opponent.id, true);
        };
        const battle = client.games.get(gameId).data;
        while (!battle.winner) {
            const choice = await battle.attacker.chooseAction(message.channel);
            if (choice === 'attack') {
                const damage = randomRange(battle.defender.guard ? 5 : 20, battle.defender.guard ? 20 : 50);
                await message.channel.send(`${battle.attacker} deals **${damage}** damage!`);
                battle.defender.dealDamage(damage);
                battle.reset();
            } else if (choice === 'defend') {
                await message.channel.send(`${battle.attacker} defends!`);
                battle.attacker.changeGuard();
                battle.reset(false);
            } else if (choice === 'special') {
                const miss = Math.floor(Math.random() * 5);
                if (miss === 0 || miss === 3) {
                    await message.channel.send(`${battle.attacker}'s special attack missed!`);
                } else if (miss === 1 || miss === 5) {
                    const damage = randomRange(battle.defender.guard ? 10 : 40, battle.defender.guard ? 40 : 100);
                    await message.channel.send(`${battle.attacker}'s special attack grazed the opponent, dealing **${damage}** damage!`);
                    battle.defender.dealDamage(damage);
                } else if (miss === 2) {
                    const damage = randomRange(battle.defender.guard ? 20 : 80, battle.defender.guard ? 80 : 200);
                    await message.channel.send(`${battle.attacker}'s special attack hit directly, dealing **${damage}** damage!`);
                    battle.defender.dealDamage(damage);
                }
                battle.attacker.useMP(25);
                battle.reset();
            } else if (choice === 'cure') {
                const amount = Math.round(battle.attacker.mp / 2);
                await message.channel.send(`${battle.attacker} heals **${amount}** HP!`);
                battle.attacker.heal(amount);
                battle.attacker.useMP(battle.attacker.mp);
                battle.reset();
            } else if (choice === 'final') {
                await message.channel.send(`${battle.attacker} uses their final move, dealing **100** damage!`);
                battle.defender.dealDamage(100);
                battle.attacker.useMP(50);
                battle.attacker.usedFinal = true;
                battle.reset();
            } else if (choice === 'run') {
                await message.channel.send(`${battle.attacker} flees!`);
                battle.attacker.forfeit();
            } else if (choice === 'failed:time') {
                await message.channel.send(`time's up, ${battle.attacker}!`);
                battle.reset();
                if (battle.lastTurnTimeout) {
                    battle.endedDueToInactivity = true;
                    break;
                } else {
                    battle.lastTurnTimeout = true;
                }
            } else {
                await message.channel.send('i do not understand what you want me to do :(');
            }
            if (choice !== 'failed:time' && battle.lastTurnTimeout) battle.lastTurnTimeout = false;
        };
        client.isPlaying.delete(message.author.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(gameId);
        if (battle.winner === 'time') return message.channel.send('i ended the game since there was no activity :pensive:');
        const winner = message.guild.members.cache.get(battle.winner.toString().replace(/[<>@!]/g, "")).user;
        const lost = winner.id === message.author.id ? opponent : message.author;
        if (!lost.bot) {
            await client.db.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: lost.id
            }, {
                guildId: message.guild.id,
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
                guildId: message.guild.id,
                userId: winner.id
            }, {
                guildId: message.guild.id,
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
            return message.channel.send(`the match is over! congrats, ${winner} !\n\n⏣ __**${amount}**__ token was placed in your wallet as a reward!\ncurrent balance: \`${storageAfter.balance}\``);
        } else {
            return message.channel.send(`the match is over! congrats, ${winner}!`);
        }
    } catch (err) {
        client.isPlaying.delete(message.author.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(gameId);
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
    aliases: ["fight", "war"],
    cooldown: 6,
    guildOnly: true,
};