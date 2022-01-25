const difficulties = ['baby', 'easy', 'medium', 'hard', 'extreme', 'impossible'];
const operations = ['+', '-', '*'];
const maxValues = {
    baby: 10,
    easy: 50,
    medium: 100,
    hard: 500,
    extreme: 1000,
    impossible: 50000
};
const maxMultiplyValues = {
    baby: 5,
    easy: 12,
    medium: 30,
    hard: 50,
    extreme: 100,
    impossible: 10000
};

const toName = {
    baby: 'Auto',
    easy: 'Easy',
    medium: 'Normal',
    hard: 'Hard',
    extreme: 'Insane',
    impossible: 'Demon'
};

exports.run = async(client, message) => {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let answer;
    let value1;
    let value2;
    switch (operation) {
        case '+':
            value1 = Math.floor(Math.random() * maxValues[difficulty]) + 1;
            value2 = Math.floor(Math.random() * maxValues[difficulty]) + 1;
            answer = value1 + value2;
            break;
        case '-':
            value1 = Math.floor(Math.random() * maxValues[difficulty]) + 1;
            value2 = Math.floor(Math.random() * maxValues[difficulty]) + 1;
            answer = value1 - value2;
            break;
        case '*':
            value1 = Math.floor(Math.random() * maxMultiplyValues[difficulty]) + 1;
            value2 = Math.floor(Math.random() * maxMultiplyValues[difficulty]) + 1;
            answer = value1 * value2;
            break;
    }
    await message.channel.send(`you have 10 seconds to answer this math problem: (${toName[difficulty]}) **${value1} ${operation} ${value2} = ?**`);
    const msgs = await message.channel.awaitMessages({
        filter: res => res.author.id === message.author.id,
        max: 1,
        time: 10000
    });
    if (!msgs.size) return message.channel.send(`sorry! time is up! it was **${answer}** :pensive:`);
    if (msgs.first().content !== answer.toString()) return message.channel.send(`nope, sorry, the answer is **${answer}** :pensive:`);
    let amount = getRandomInt(10, 15);
    await client.db.money.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        $inc: {
            balance: amount,
        },
    }, {
        upsert: true,
        new: true,
    });
    return message.channel.send(`great job! 10/10! ⏣ __${amount}__ token was placed in your wallet as a reward!`);
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.help = {
    name: "math-quiz",
    description: "see how fast you can answer a math problem in a given time limit.",
    usage: ["math-quiz"],
    example: ["math-quiz"]
};

exports.conf = {
    aliases: ["mathquiz", "math"],
    cooldown: 3,
    guildOnly: true,
};