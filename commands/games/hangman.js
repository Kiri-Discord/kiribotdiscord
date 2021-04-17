const utils = require('../../util/util');
const { verify } = require('../../util/util');

class Game { 
    constructor(client, message, challenged) { 

        this.stages = ['\_\_\_\n*      |\n*    \n*    \n*      \n*    \n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*      | \n*      \n*    \n*',

            '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      \n*    \n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    \n*',

            '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    /\n*', '\_\_\_\n*      |\n*    :dizzy_face: \n*    /|\\ \n*      |\n*    / \\\n*'];
        this.message = message;
        this.challenged = challenged;
        this.guesses = '';
        this.typedLetters = [];
        this.correct = 0;
        this.letters = 0;
        this.stage = 0;
        this.client = client;
    }

    async init() {

        try {
            this.dmChannel = await this.message.author.send('please enter the word to be guessed :D')
        } catch (error) {
            this.end();
            return this.message.inlineReply("your DM is still locked so i can't get the word from you :( enable your DM.").then(i => i.delete({ timeout: 10000 }))
        }
        this.msg = await this.message.channel.send(`${this.stages[0]}\nwaiting for <@${this.message.author.id}> to enter a word`);
        


        let word = await this.dmChannel.channel.awaitMessages(m => m.author.id === this.message.author.id, {
            max: 1,
            time: 60000,
            errors: ['time'],
        }).catch(() => {
            this.end();
            this.message.author.send('this game has expired lmao');
        });
        this.word = word.get(Array.from(word.keys()).toString()).content;
        this.displayWord = '';
        for (let i = 0; i < this.word.length; i++) this.displayWord += '-';
        this.msg.edit(`${this.stages[0]}\n\`\`${this.displayWord}\`\`\n wrong guesses: ${this.guesses}`);
        this.run();
    }

    async run() {
        let word = await this.message.channel.awaitMessages(m => m.author.id === this.challenged.id, {
            max: 1,
            time: 60000,
            errors: ['time'],
        }).catch(() => {
            this.end();
            this.msg.edit('this game has expired lmao');
        });
        this.letter = word.get(Array.from(word.keys()).toString()).content;
        if (this.letter.length > 1) return this.run();
        if (this.guesses.includes(this.letter)) return this.run();
        if (this.word.toLowerCase().includes(this.letter.toLowerCase())) { this.letters++; } else {
            this.stage++;
            this.guesses += `${this.letter.toLowerCase()} `;
            this.msg.edit(`${this.stages[this.stage]}\n\`\`${this.displayWord}\`\`\n Wrong Guesses: ${this.guesses}`);
        }

        if (this.typedLetters.includes(this.letter)) {
            this.message.channel.send(`${this.challenged}, you have allready guessed that letter!`);
            return this.run();
        }

        for (let i = 0; i < this.word.length; i++) {
            if (this.word.charAt(i).toLowerCase() === this.letter.toLowerCase()) {
                this.displayWord = this.displayWord.substr(0, i) + this.letter + this.displayWord.substr(i + 1);
                this.msg.edit(`${this.stages[this.stage]}\n\`\`${this.displayWord}\`\`\n wrong guesses: ${this.guesses}`);
                this.correct++;
                this.typedLetters.push(this.letter);
            }
        }

        if (this.correct === this.word.length) {
            this.end();
            return this.msg.edit(`${this.stages[this.stage]}\nyou won! \`\`${this.word}\`\`\n wrong guesses: ${this.guesses}`);
        }

        if (this.stage === 5) {
            this.end();
            return this.msg.edit(this.msg.edit(`${this.stages[this.stage]}\nyou lost! the word was \`\`${this.word}\`\`\n wrong guesses: ${this.guesses}`));
        }
        this.run();
    }

    end() {
        this.client.games.delete(this.message.channel.id);
        utils.inGame = utils.inGame.filter(i => i !== this.message.author.id);
        utils.inGame = utils.inGame.filter(i => i !== this.challenged.id);
        this.game = null;
    }
}


exports.run = async (client, message, args) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.inlineReply(current.prompt);
    const member = await getMemberfromMention(args[0], message.guild);
    if (!member) return message.inlineReply('who do you want to play with ?');
    const challenged = member.user;
    if (challenged.id === message.author.id) return message.inlineReply("you can't play against yourself!");
    if (challenged.id === client.user.id) return message.inlineReply("you can't play against me!");
    if (challenged.bot) return message.inlineReply("you can't play against bots!");

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:' ;
    await message.channel.send(`${challenged}, do you accept this challenge? \`y/n\``);
    const verification = await verify(message.channel, challenged);
    if (!verification) return message.channel.send(`looks like they declined... ${sedEmoji}`);

    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** and **${challenged.username}** finish playing hangman :(` });
    if (utils.inGame.includes(message.author.id)) return message.inlineReply('you are allready in a game. please finish that first.');
    if (utils.inGame.includes(challenged.id)) return message.inlineReply('that user is allready in a game. try again in a minute.');
    utils.inGame.push(challenged.id, message.author.id);

    const game = new Game(client, message, challenged);
    game.init();
}


exports.help = {
	name: "hangman",
	description: "a game of hangman. try it out!",
	usage: "hangman <@mention>",
	example: "hangman @kuru"
};
  
exports.conf = {
	aliases: [],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};
