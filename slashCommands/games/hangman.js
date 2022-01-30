const { buttonVerify } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');

class Game {
    constructor(client, interaction, challenged) {
        this.stages = ['\_\_\_\n*      |\n*    \n*    \n*      \n*    \n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*      | \n*      \n*    \n*',

            '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      \n*    \n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    \n*',

            '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    /\n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    / \\\n*'
        ];
        this.interaction = interaction;
        this.challenged = challenged;
        this.guesses = '';
        this.typedLetters = [];
        this.correct = 0;
        this.letters = 0;
        this.stage = 0;
        this.client = client;
    };
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    async init() {
        try {
            this.dmChannel = await this.interaction.user.send(`please enter the word that you want your opponent to guess :face_with_monocle:`);
        } catch (error) {
            this.end();
            return this.interaction.channel.send(`${this.interaction.user}, your DM is still locked so i can't send the instruction to you! enable your DM first :pensive:`).then(i => {
                setTimeout(() => {
                    i.delete()
                }, 10000);
            });
        };
        this.msg = await this.interaction.channel.send(`${this.stages[0]}\nwaiting for <@${this.interaction.user.id}> to enter a word from their DM...`);

        const words = await this.dmChannel.channel.awaitMessages({
            filter: m => m.author.id === this.interaction.user.id && m.content,
            max: 1,
            time: 60000
        });
        const word = words.first();
        if (!words.size || !word) {
            this.end();
            return this.interaction.user.send(`this game has expired since you didn't provide any valid word :pensive:`);
        };
        const content = word.content;
        this.word = content;
        this.displayWord = '';
        for (let i = 0; i < this.word.length; i++) this.displayWord += '-';
        this.msg.edit(`${this.stages[0]}\n\`${this.displayWord}\`\n wrong guesses: ${this.guesses}`);
        this.run();
    };
    async run() {
        const words = await this.interaction.channel.awaitMessages({
            filter: m => m.author.id === this.challenged.id && m.content,
            max: 1,
            time: 60000
        });
        const word = words.first();
        if (!words.size || !word) {
            this.end();
            return this.msg.edit('this game has expired lmao');
        };
        const content = word.content;
        this.letter = content;
        if (this.letter.length > 1) return this.run();
        if (this.guesses.includes(this.letter)) return this.run();
        if (this.word.toLowerCase().includes(this.letter.toLowerCase())) { this.letters++; } else {
            this.stage++;
            this.guesses += `${this.letter.toLowerCase()} `;
            this.msg.edit(`${this.stages[this.stage]}\n\`${this.displayWord}\`\n wrong guesses: ${this.guesses}`);
        };

        if (this.typedLetters.includes(this.letter)) {
            this.interaction.channel.send(`${this.challenged}, you have allready guessed that letter!`);
            return this.run();
        };

        for (let i = 0; i < this.word.length; i++) {
            if (this.word.charAt(i).toLowerCase() === this.letter.toLowerCase()) {
                this.displayWord = this.displayWord.substr(0, i) + this.letter + this.displayWord.substr(i + 1);
                this.msg.edit(`${this.stages[this.stage]}\n\`${this.displayWord}\`\n wrong guesses: ${this.guesses}`);
                this.correct++;
                this.typedLetters.push(this.letter);
            };
        };

        if (this.correct === this.word.length) {
            this.end();
            let amount = this.getRandomInt(10, 15);
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
            return this.msg.edit(`${this.stages[this.stage]}\nyou won! \`${this.word}\`\n wrong guesses: ${this.guesses}\n⏣ __${amount}__ token was placed in your wallet as a reward!`);
        };

        if (this.stage === 5) {
            this.end();
            let amount = this.getRandomInt(10, 15);
            await this.client.db.money.findOneAndUpdate({
                guildId: this.interaction.guild.id,
                userId: this.interaction.user.id
            }, {
                guildId: this.interaction.guild.id,
                userId: this.interaction.user.id,
                $inc: {
                    matchPlayed: 1,
                    win: 1,
                    balance: amount
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
            return this.msg.edit(`${this.stages[this.stage]}\nyou lost! the word was \`${this.word}\`\n wrong guesses: ${this.guesses}`);
        };
        this.run();
    };

    end() {
        this.client.games.delete(this.interaction.channel.id);
        this.client.isPlaying.delete(this.interaction.user.id);
        this.client.isPlaying.delete(this.challenged.id);
        this.game = null;
    };
};


exports.run = async(client, interaction) => {
    const current = client.games.get(interaction.channel.id);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });

    const member = interaction.options.getMember('opponent');
    const challenged = member.user;

    if (challenged.id === interaction.user.id) return interaction.reply({ content: "you can't play against yourself!", ephemeral: true });
    if (challenged.id === client.user.id) return interaction.reply({ content: "you can't play against me!", ephemeral: true });
    if (challenged.bot) return interaction.reply({ content: "you can't play against bots!", ephemeral: true });

    if (client.isPlaying.get(interaction.user.id)) return interaction.reply({ content: 'you are allready in a game. please finish that first.', ephemeral: true });
    if (client.isPlaying.get(challenged.id)) return interaction.reply({ content: 'that user is allready in a game. try again in a minute.', ephemeral: true });

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    client.games.set(interaction.channel.id, { prompt: `please wait until **${interaction.user.username}** and **${challenged.username}** finish playing :(` });

    await interaction.deferReply();
    const verification = await buttonVerify(interaction.channel, challenged, `${challenged}, do you accept this challenge?`);
    if (!verification) {
        client.games.delete(interaction.channel.id)
        return interaction.editReply(`looks like they declined... ${sedEmoji}`);
    };
    interaction.editReply({ content: 'beginning the Hangman game..' });
    client.isPlaying.set(challenged.id, true);
    client.isPlaying.set(interaction.user.id, true);
    const game = new Game(client, interaction, challenged);
    game.init();
};


exports.help = {
    name: "hangman",
    description: "challenge another user with a game of Hangman",
    usage: ["hangman `<@mention>`"],
    example: ["hangman `@kuru`"]
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
    cooldown: 5,
    guildOnly: true,
};
