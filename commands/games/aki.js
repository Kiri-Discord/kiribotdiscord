const { Aki } = require('aki-api');
const region = 'en';
const { MessageEmbed } = require('discord.js');

class Game {
    constructor(client, message) {
        this.message = message;
        this.aki = new Aki(region);
        this.client = client
    }

    async init() {
        await this.aki.start();
        this.message.channel.send('are you thinking of a character and ready to begin? y / n').then(msg => { this.msg = msg; });
        const filter = m => /^[yn]$/i.test(m.content) && m.author === this.message.author;
        const response = await this.getResponse(filter);
        if (response === 'y') this.run();
    }

    async run() {
        this.msg.edit('', new MessageEmbed()
            .setColor('#DAF7A6')
            .setAuthor(this.message.member.displayName,  this.message.author.displayAvatarURL({ dynamic: true }))
            .setFooter(this.client.user.tag, this.client.user.displayAvatarURL())
            .setTimestamp(new Date())
            .setTitle('Akinator:')
            
            .addFields(
                { name: 'Question:', value: this.aki.question },
                { name: 'Answers:', value: `\n[0] ${this.aki.answers[0]}\n[1] ${this.aki.answers[1]}\n[2] ${this.aki.answers[2]}\n[3] ${this.aki.answers[3]}\n[4] ${this.aki.answers[4]}\n[5] Back` },
                { name: 'Progress:', value: this.aki.progress },
            ));

        const filter = m => /^[0-5]$/i.test(m.content) && m.author === this.message.author;
        const response = await this.getResponse(filter);
        if (response === '5') await this.aki.back();
        else await this.aki.step(parseInt(response));

        if (this.aki.progress >= 70 || this.aki.currentStep >= 78) {
            this.i = 0;
            await this.aki.win();
            return this.win();
        }
        this.run();
    }

    async win() {
        const answer = this.aki.answers[this.i];
        if (!answer) return this.msg.edit(':confused: I don\'t know.');
        const embed = new MessageEmbed()
            .setTitle(`Akinator Guess ${this.i + 1}:`)
            .setColor('#3498db')
            .setAuthor(this.message.member.displayName,  this.message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp(new Date())
            .addField(`Name: ${answer.name}`, `Description: ${answer.description}`)
            .setImage(answer.absolute_picture_path)
            .setDescription('Is this guess correct? Type y / n')
            .setFooter(this.client.user.tag, this.client.user.displayAvatarURL());

        this.msg.edit(embed);
        const filter = m => /^[yn]$/i.test(m.content) && m.author === this.message.author;
        const response = await this.getResponse(filter);
        if (response === 'n') {
            this.i++;
            this.win();
        } else {
            this.msg.edit('I win again!');
        }
    }

    async getResponse(filter) {
        let response;
        const responseAwait = await this.message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time'],
        }).catch(() => {
            this.msg.edit('The game has timed out');
            response = 'exit';
        });
        if (response !== 'exit') {
            response = responseAwait.get(Array.from(responseAwait.keys()).toString()).content;
            this.message.channel.bulkDelete(1);
            return response;
        }
    }
}

exports.run = async (client, message, args) => {
    const game = new Game(client, message);
    game.init();
},


exports.help = {
	name: "aki",
	description: "Think about a real or fictional character.\nI will try to guess who it is 😄",
	usage: "aki",
	example: "aki"
};
  
exports.conf = {
	aliases: ["akinator"],
	cooldown: 5
};
