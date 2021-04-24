const { stripIndents } = require('common-tags');
const { shuffle } = require('../../util/util');
const { questions, houses, descriptions } = require('../../assets/sorting-hat.json');
const choices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];


exports.run = async (client, message, args) => {
    const current = client.games.get(message.channel.id);
	if (current) return message.inlineReply(current.prompt);
	client.games.set(message.channel.id, { prompt: `you should wait until **${message.author.username}** is finished first :(` });
    try {
        const points = {
            g: 0,
            s: 0,
            h: 0,
            r: 0
        };
        const blacklist = [];
        const questionNums = ['2', '3', '4', '5', '6', '7'];
        let turn = 1;
        while (turn < 9) {
            let question;
            if (turn === 1) {
                question = questions.first[Math.floor(Math.random() * questions.first.length)];
            } else if (turn === 8) {
                question = questions.last[Math.floor(Math.random() * questions.last.length)];
            } else {
                const possible = questionNums.filter(num => !blacklist.includes(num));
                const value = possible[Math.floor(Math.random() * possible.length)];
                const group = questions[value];
                blacklist.push(value);
                question = group[Math.floor(Math.random() * group.length)];
            }
            const answers = shuffle(question.answers);
            await message.channel.send(stripIndents`
                **${turn})** **${question.text}**
                
                ${answers.map((answer, i) => `- **${choices[i]}.** ${answer.text}`).join('\n')}
            `);
            const filter = res =>
                res.author.id === message.author.id && choices.slice(0, answers.length).includes(res.content.toUpperCase());
            const choice = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 120000
            });
            if (!choice.size) {
                client.games.delete(message.channel.id);
                return message.channel.send('oh no, you ran out of time! too bad :pensive:');
            }
            const answer = answers[choices.indexOf(choice.first().content.toUpperCase())];
            for (const [house, amount] of Object.entries(answer.points)) points[house] += amount;
            ++turn;
        }
        const houseResult = Object.keys(points).filter(h => points[h] > 0).sort((a, b) => points[b] - points[a]);
        client.games.delete(message.channel.id);
        const totalPoints = houseResult.reduce((a, b) => a + points[b], 0);
        return message.channel.send(stripIndents`
            you are a member of... **${houses[houseResult[0]]}**!

            _${descriptions[houseResult[0]]}_
            ${houseResult.map(house => `${houses[house]}: ${Math.round((points[house] / totalPoints) * 100)}%`).join('\n')}
        `);
    } catch (err) {
        client.games.delete(message.channel.id);
        throw err;
    }
}

exports.help = {
  name: "hogwarts",
  description: "a quiz to determine your Hogwarts house in Harry Porter :joy:",
  usage: "hogwarts",
  example: "hogwarts"
}

exports.conf = {
  aliases: ["hogwarts-house", "sorting-hat", "sorting-hat-quiz"],
  cooldown: 4,
  guildOnly: true,
}