const Battle = require('../../features/battle/battle');
const { randomRange, verify } = require('../../util/util');

exports.run = async (client, message, args) => {
    const opponent = message.mentions.users.first() || client.user;
    if (opponent.id === message.author.id) return message.reply('you can\'t play against yourself :(');
    if (opponent !== client.user && opponent.bot) return message.reply('i am the only bot who can fight with you :) no, i am not looking at you, <@!270904126974590976>');
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(current.prompt);
    client.games.set(message.channel.id, { name: this.name, data: new Battle(message.author, opponent), prompt: `you should wait until **${message.author.username}** and **${opponent.username}** finish fighting :)` });
    const battle = client.games.get(message.channel.id).data;
    try {
        if (!opponent.bot) {
            await message.channel.send(`${opponent}, do you accept this challenge? \`y/n\``);
            const verification = await verify(message.channel, opponent);
            if (!verification) {
                client.games.delete(message.channel.id);
                return message.reply('looks like they declined :(');
            }
        }
        while (!battle.winner) {
            const choice = await battle.attacker.chooseAction(message);
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
                await message.channel.send('i do not understand what you want to do :(');
            }
            if (choice !== 'failed:time' && battle.lastTurnTimeout) battle.lastTurnTimeout = false;
        }
        client.games.delete(message.channel.id);
        if (battle.winner === 'time') return message.channel.send('Game ended due to inactivity.');
        return message.channel.send(`the match is over! congrats, ${battle.winner}!`);
    } catch (err) {
        client.games.delete(message.channel.id);
        throw err;
    }
}

exports.help = {
	name: "battle",
	description: "engage in a turn-based battle against another user or me!",
	usage: "battle `<@mention>`",
	example: "battle `@bell`"
};
  
exports.conf = {
	aliases: ["fight", "war"],
    cooldown: 6,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};
