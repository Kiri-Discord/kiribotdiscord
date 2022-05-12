const { buttonVerify } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');
const rep = ['r', 'p', 's'];

class Game {
    constructor(interaction, challenged, client) {
        this.interaction = interaction;
        this.challenged = challenged;
        this.client = client;
    };

    async run() {
        let p1Message;
        let p2Message;
        const filter = m => rep.includes(m.content.trim().toLowerCase())
        this.interaction.channel.send(`you have challenged ${this.challenged.toString()} to a game of **rock-paper-scissors**! please move into DMs.`);
        try {
            p1Message = await this.interaction.user.send('you have created a game of rps. please choose \`r, p, s\`');
            p2Message = await this.challenged.send('you have been challenged to a game of rps. please choose \`r, p, s\`');
        } catch (error) {
            this.endGame();
            return this.interaction.channel.send("your DM or your opponent's DM is still locked so i can't get the choice from you :pensive: enable your both DMs.").then(i => {
                setTimeout(() => {
                    i.delete();
                }, 10000);
            })
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
        if (p1Choise === 's' && p2Choise === 'p') return this.win('p1', p1Choise, p2Choise);
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
                this.interaction.user.send(`you won the game! **${this.challenged.username}** responded with \`${toName[p2]}\``);
                this.challenged.send(`you lost the game! **${this.interaction.user.username}** responded with \`${toName[p1]}\` :pensive:`);
                break;
            case 'p2':
                this.challenged.send(`you won the game! **${this.interaction.user.username}** responded with \`${toName[p1]}\``);
                this.interaction.user.send(`you lost the game! **${this.challenged.username}** responded with \`${toName[p2]}\` :pensive:`);
                break;
            case 'draw':
                this.interaction.user.send(`it was a draw. **${this.challenged.username}** responded with \`${toName[p2]}\``);
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
                winMessage = `**${this.interaction.user.username}** wins!`;
                await this.client.db.money.findOneAndUpdate({
                    guildId: this.interaction.guild.id,
                    userId: this.interaction.user.id
                }, {
                    guildId: this.interaction.guild.id,
                    userId: this.interaction.user.id,
                    $inc: {
                        balance: amount,
                        matchPlayed: 1,
                        win: 1
                    },
                }, {
                    upsert: true,
                    new: true,
                });
                await this.client.db.money.findOneAndUpdate({
                    guildId: this.interaction.guild.id,
                    userId: this.challenged.id
                }, {
                    guildId: this.interaction.guild.id,
                    userId: this.challenged.id,
                    $inc: {
                        matchPlayed: 1,
                        lose: 1
                    },
                }, {
                    upsert: true,
                    new: true,
                });
                winMessage += ` ⏣ __${amount}__ token was placed in their wallet as a reward!`
                break;
            case 'p2':
                winMessage = `**${this.challenged.username}** wins!`;
                await this.client.db.money.findOneAndUpdate({
                    guildId: this.interaction.guild.id,
                    userId: this.interaction.user.id
                }, {
                    guildId: this.interaction.guild.id,
                    userId: this.interaction.user.id,
                    $inc: {
                        matchPlayed: 1,
                        lose: 1
                    },
                }, {
                    upsert: true,
                    new: true,
                });
                await this.client.db.money.findOneAndUpdate({
                    guildId: this.interaction.guild.id,
                    userId: this.challenged.id
                }, {
                    guildId: this.interaction.guild.id,
                    userId: this.challenged.id,
                    $inc: {
                        matchPlayed: 1,
                        win: 1,
                        balance: amount
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
        this.interaction.channel.send(`game was ended! ${type ? winMessage : ''}`);
        this.client.isPlaying.delete(this.interaction.user.id);
        this.client.isPlaying.delete(this.challenged.id);
    };
};

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('opponent');
    const challenged = member.user;
    if (challenged.id === interaction.user.id) return interaction.reply({ content: "you can't play against yourself!", ephemeral: true });
    if (challenged.id === client.user.id) return interaction.reply({ content: "you can't play against me!", ephemeral: true });
    if (challenged.bot) return interaction.reply({ content: "you can't play against bots!", ephemeral: true });
    if (client.isPlaying.get(interaction.user.id)) return interaction.reply({ content: 'you are already in a game. please finish that first.', ephemeral: true });
    if (client.isPlaying.get(challenged.id)) return interaction.reply({ content: 'that user is already in a game. try again in a minute.', ephemeral: true });

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    await interaction.deferReply();
    const verification = await buttonVerify(interaction.channel, challenged, `${challenged}, do you accept this challenge?`);
    if (!verification) return interaction.editReply(`looks like they declined... ${sedEmoji}`);

    client.isPlaying.set(challenged.id, true);
    client.isPlaying.set(interaction.user.id, true);
    interaction.editReply({ content: 'beginning the Hangman game..' });
    const game = new Game(interaction, challenged, client);
    game.run();
}


exports.help = {
    name: "rock-paper-scissors",
    description: "challange a player to Rock Paper Scissors!",
    usage: ["rock-paper-scissors `<@mention>`"],
    example: ["rock-paper-scissors `@bell`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('opponent')
            .setDescription('who would you want to be your opponent?')
            .setRequired(true)
        ),
    cooldown: 4,
    guildOnly: true,
};