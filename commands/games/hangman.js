const { buttonVerify } = require('../../util/util');

class Game {
    constructor(client, message, challenged) {
        this.stages = ['\_\_\_\n*      |\n*    \n*    \n*      \n*    \n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*      | \n*      \n*    \n*',

            '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      \n*    \n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    \n*',

            '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    /\n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    / \\\n*'
        ];
        this.message = message;
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
            this.dmChannel = await this.message.author.send(`please enter the word that you want your opponent to guess :face_with_monocle:`);
        } catch (error) {
            this.end();
            return this.message.reply("your DM is still locked so i can't send the instruction to you! enable your DM first :pensive:").then(i => {
                setTimeout(() => {
                    i.delete()
                }, 10000);
            })
        }
        this.msg = await this.message.channel.send(`${this.stages[0]}\nwaiting for <@${this.message.author.id}> to enter a word from their DM...`);

        const words = await this.dmChannel.channel.awaitMessages({
            filter: m => m.author.id === this.message.author.id && m.content,
            max: 1,
            time: 60000
        });
        const word = words.first();
        if (!words.size || !word) {
            this.end();
            return this.message.author.send(`this game has expired since you didn't provide any valid word :pensive:`);
        };
        const content = word.content;
        this.word = content;
        this.displayWord = '';
        for (let i = 0; i < this.word.length; i++) this.displayWord += '-';
        this.msg.edit(`${this.stages[0]}\n\`${this.displayWord}\`\n wrong guesses: ${this.guesses}`);
        this.run();
    };
    async run() {
        const words = await this.message.channel.awaitMessages({
            filter: m => m.author.id === this.challenged.id && m.content,
            max: 1,
            time: 60000
        });
        const word = words.first()
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
            this.message.channel.send(`${this.challenged}, you have allready guessed that letter!`);
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
                guildId: this.message.guild.id,
                userId: this.challenged.id
            }, {
                guildId: this.message.guild.id,
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
                guildId: this.message.guild.id,
                userId: this.message.author.id
            }, {
                guildId: this.message.guild.id,
                userId: this.message.author.id,
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
                guildId: this.message.guild.id,
                userId: this.message.author.id
            }, {
                guildId: this.message.guild.id,
                userId: this.message.author.id,
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
                guildId: this.message.guild.id,
                userId: this.challenged.id
            }, {
                guildId: this.message.guild.id,
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
        this.client.games.delete(this.message.channel.id);
        this.client.isPlaying.delete(this.message.author.id);
        this.client.isPlaying.delete(this.challenged.id);
        this.game = null;
    };
};


exports.run = async(client, message, args) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(current.prompt);

    const member = client.utils.parseMember(message, args[0])
    if (!member) return message.reply('who do you want to play with ?');
    const challenged = member.user;

    if (challenged.id === message.author.id) return message.reply("you can't play against yourself!");
    if (challenged.id === client.user.id) return message.reply("you can't play against me!");
    if (challenged.bot) return message.reply("you can't play against bots!");

    if (client.isPlaying.get(message.author.id)) return message.reply('you are allready in a game. please finish that first.');
    if (client.isPlaying.get(challenged.id)) return message.reply('that user is allready in a game. try again in a minute.');

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** and **${challenged.username}** finish playing :(` });

    const verification = await buttonVerify(message.channel, challenged, `${challenged}, do you accept this challenge?`);
    if (!verification) {
        client.games.delete(message.channel.id)
        return message.channel.send(`looks like they declined... ${sedEmoji}`);
    };
    client.isPlaying.set(challenged.id, true);
    client.isPlaying.set(message.author.id, true);
    const game = new Game(client, message, challenged);
    game.init();
};


exports.help = {
    name: "hangman",
    description: "challenge another user with a game of Hangman",
    usage: ["hangman `<@mention>`"],
    example: ["hangman `@kuru`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
};
