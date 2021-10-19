const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const request = require('node-superfetch');
const { shuffle } = require('../../util/util');
const difficulties = ['easy', 'medium', 'hard'];
const choices = ['A', 'B', 'C', 'D'];

exports.run = async(client, message, args) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.channel.send(current.prompt);
    const sadEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const duhEmoji = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':(';
    let difficulty;
    if (args[0]) {
        if (difficulties.includes(args[0].toLowerCase())) {
            difficulty = args[0].toLowerCase();
        } else {
            return message.channel.send(`\`${args[0]}\` is not a valid difficulty! can you try again with \`${difficulties.join(", ")}\`? ${sadEmoji}`)
        };
    } else {
        difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    };
    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** is finished with their game first ${duhEmoji}` });
    const { body } = await request
        .get('https://opentdb.com/api.php')
        .query({
            amount: 1,
            type: 'multiple',
            encode: 'url3986',
            difficulty
        });
    if (!body.results) return message.channel.send(`i couldn't fetch any trivia question! try again later ${sadEmoji}`);
    const answers = body.results[0].incorrect_answers.map(answer => decodeURIComponent(answer));
    const correct = decodeURIComponent(body.results[0].correct_answer);
    answers.push(correct);
    const shuffled = shuffle(answers);
    const questionEmbed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setFooter(`this question will be timed out in 15 seconds`)
        .setTitle('Trivia')
        .addField('Topic', `\`${decodeURIComponent(body.results[0].category)}\``, true)
        .addField('Question', `**${decodeURIComponent(body.results[0].question)}**`, true)
        .addField('Answers', shuffled.map((answer, i) => `**${choices[i]}** \`${answer}\``).join('\n'))
        .setColor('#bee7f7')
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('A')
            .setLabel('A')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('B')
            .setLabel('B')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('C')
            .setLabel('C')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('D')
            .setLabel('D')
            .setStyle('SECONDARY')
        );
    const msg = await message.channel.send({ embeds: [questionEmbed], components: [row] });
    const collector = msg.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 15000,
        max: 1
    });
    let winner;

    collector.on('collect', async res => {
        await res.deferReply();
        const answerEmbed = new MessageEmbed()
            .setColor('#bee7f7')
        if (shuffled[choices.indexOf(res.customId)] === correct) {
            row.components.find(component => component.customId === res.customId).style = 'SUCCESS';
            winner = res.user;
            let amount = getRandomInt(20, 40);
            const storageAfter = await client.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: winner.id
            }, {
                guildId: message.guild.id,
                userId: winner.id,
                $inc: {
                    balance: amount,
                },
            }, {
                upsert: true,
                new: true,
            });
            answerEmbed
                .setFooter(`your current balance: ${storageAfter.balance}`)
                .setTitle(`you gave the correct answer, ${winner.username}`)
                .setDescription(`⏣ **${amount}** token was placed in your wallet :boom:`)
            res.editReply({ embeds: [answerEmbed] });
        } else {
            answerEmbed
                .setFooter('better luck next time!')
                .setTitle(`sorry, you provided a wrong answer!`)
                .setDescription(`the correct answer was: \`${correct}\` ${sadEmoji}`)
            res.editReply({ embeds: [answerEmbed] });
        };
    });
    collector.on('end', (collected) => {
        client.games.delete(message.channel.id);
        if (collected.size && shuffled[choices.indexOf(collected.first().customId)] !== correct) row.components.find(component => component.customId === collected.first().customId).style = 'DANGER';
        // row.components.find(component => shuffled[choices.indexOf(component.customId)] === correct).style = 'SUCCESS';
        row.components.forEach(component => {
            if (shuffled[choices.indexOf(component.customId)] === correct) component.style = 'SUCCESS';
            component.setDisabled(true)
        });
        return msg.edit({ components: [row] });
    });
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.help = {
    name: "trivia",
    description: "compete against your friends in a game of trivia (anyone can answer)\nif no difficulty is given, a random one will be chosen :)\nthe question will expire after 15 seconds.",
    usage: ["trivia `[difficulty]`", "trivia"],
    example: ["trivia `hard`", "trivia"]
};

exports.conf = {
    aliases: ["quiz"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};