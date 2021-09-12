const utils = require('../../util/util');
const { verify } = require('../../util/util');
const rep = ['r', 'p', 's'];


class Game {
    constructor(message, challenged, args) {
        this.message = message;
        this.challenged = challenged;
        this.args = args;
    };

    async run() {
        let p1Message;
        let p2Message;
        const filter = m => rep.includes(m.content.trim().toLowerCase())
        this.message.channel.send(`you have challenged ${this.args[0]} to a game of **rock-paper-scissors**! please move into DMs.`);
        try {
            p1Message = await this.message.author.send('you have created a game of rps. please choose \`r, p, s\`');
            p2Message = await this.challenged.send('you have been challenged to a game of rps. please choose \`r, p, s\`');
        } catch (error) {
            this.endGame();
            return this.message.reply("your DM or your opponent's DM is still locked so i can't get the choice from you :( enable your both DMs.").then(i => i.delete({ timeout: 10000 }))
        };
        Promise.all([
            p1Message.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time'],
            }),
            p2Message.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time'],
            })
        ]).then(values => {
            if (values[0].size !== 'undefined' || typeof values[1] !== 'undefined') {
                this.winChecks(values);
            } else {
                this.endGame();
            };
        })
    };

    winChecks(values) {
        const p1Choise = values[0].get(Array.from(values[0].keys()).toString()).content.toLowerCase()
        const p2Choise = values[1].get(Array.from(values[1].keys()).toString()).content.toLowerCase();

        if (p1Choise === 'r' && p2Choise === 's') return this.win('p1', p1Choise, p2Choise);
        else if (p2Choise === 'r' && p1Choise === 's') return this.win('p2', p1Choise, p2Choise);
        else if (p2Choise === 'r' && p1Choise === 'r') return this.win('draw', p1Choise, p2Choise); // Rock checks
        if (p1Choise === 'p' && p2Choise === 'r') return this.win('p1', p1Choise, p2Choise);
        else if (p2Choise === 'p' && p1Choise === 'r') return this.win('p2', p1Choise, p2Choise);
        else if (p2Choise === 'p' && p1Choise === 'p') return this.win('draw', p1Choise, p2Choise); // Paper checks
        if (p1Choise === 's' && p2Choise === 'p') return this.win('p1'), p1Choise, p2Choise;
        else if (p2Choise === 's' && p1Choise === 'p') return this.win('p2', p1Choise, p2Choise);
        else if (p2Choise === 's' && p1Choise === 's') return this.win('draw', p1Choise, p2Choise); // Scissors checks
    };

    win(type, p1, p2) {
        const toName = {
            'r': 'Rock',
            'p': 'Paper',
            's': 'Scissors'
        }
        switch (type) { // sending win messages based on the outcome of the win calculations
            case 'p1':
                this.message.author.send(`you won the game! **${this.challenged.username}** responded with \`${toName[p2]}\``);
                this.challenged.send(`you lost the game! **${this.message.author.username}** responded with \`${toName[p1]}\` :pensive:`);
                break;
            case 'p2':
                this.challenged.send(`you won the game! **${this.message.author.username}** responded with \`${toName[p1]}\``);
                this.message.author.send(`you lost the game! **${this.challenged.username}** responded with \`${toName[p2]}\` :pensive:`);
                break;
            case 'draw':
                this.message.author.send(`it was a draw. **${this.challenged.username}** responded with \`${toName[p2]}\``);
                this.challenged.send(`it was a draw. **${this.challenged.username}** responded with \`${toName[p2]}\``);
                break;
        };
        this.endGame(type);
    };
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    async endGame(type) {
        let winMessage;
        let amount = this.getRandomInt(10, 15);
        switch (type) {
            case 'p1':
                winMessage = `**${this.message.author.username}** wins!`;
                await this.client.money.findOneAndUpdate({
                    guildId: this.message.guild.id,
                    userId: this.message.author.id
                }, {
                    guildId: this.message.guild.id,
                    userId: this.message.author.id,
                    $inc: {
                        balance: amount,
                    },
                }, {
                    upsert: true,
                    new: true,
                });
                winMessage += ` ⏣ __${amount}__ token was placed in their wallet as a reward!`
                break;
            case 'p2':
                winMessage = `**${this.challenged.username}** wins!`;
                await this.client.money.findOneAndUpdate({
                    guildId: this.message.guild.id,
                    userId: this.challenged.id
                }, {
                    guildId: this.message.guild.id,
                    userId: this.challenged.id,
                    $inc: {
                        balance: amount,
                    },
                }, {
                    upsert: true,
                    new: true,
                });
                winMessage += ` ⏣ __${amount}__ token was placed in their wallet as a reward!`
                break;
            case 'draw':
                winMessage = 'it was a draw.'
                break;
        };
        this.message.channel.send(`game was ended! ${type ? winMessage : ''}`);
        utils.inGame = utils.inGame.filter(i => i !== this.message.author.id);
        utils.inGame = utils.inGame.filter(i => i !== this.challenged.id);
    };
};

exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);
    if (!member) return message.reply('who do you want to play with ?');
    const challenged = member.user;
    if (challenged.id === message.author.id) return message.reply("you can't play against yourself!");
    if (challenged.id === client.user.id) return message.reply("you can't play against me!");
    if (challenged.bot) return message.reply("you can't play against bots!");
    if (utils.inGame.includes(message.author.id)) return message.reply('you are already in a game. please finish that first.');
    if (utils.inGame.includes(challenged.id)) return message.reply('that user is already in a game. try again in a minute.');

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    await message.channel.send(`${challenged}, do you accept this challenge? \`y/n\``);
    const verification = await verify(message.channel, challenged);
    if (!verification) return message.channel.send(`looks like they declined... ${sedEmoji}`);

    utils.inGame.push(challenged.id, message.author.id);
    const game = new Game(message, challenged, args);
    game.run();
}


exports.help = {
    name: "rock-paper-scissors",
    description: "challange a player to Rock Paper Scissors!",
    usage: ["rock-paper-scissors `<@mention>`"],
    example: ["rock-paper-scissors `@bell`"]
};

exports.conf = {
    aliases: ["rps", "rockpaperscissors"],
    cooldown: 4,
    guildOnly: true,
};