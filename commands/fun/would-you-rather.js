const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const { formatNumber } = require('../../util/util');
const choices = ['1', '2'];


exports.run = async (client, message, args) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(current.prompt);
    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** is finished first :(` });
    try {
        const data = await fetchScenario();
        await message.channel.send(stripIndents`
            ${data.prefix ? `${data.prefix.toLowerCase()}, would you rather...` : 'would you rather...'}
            **1.** ${data.option_1.toLowerCase()}
            **2.** ${data.option_2.toLowerCase()}
            _respond with either **1** or **2** to continue._
        `);
        const filter = res => res.author.id === message.author.id && choices.includes(res.content.toLowerCase());
        const msgs = await message.channel.awaitMessages(filter, {
            time: 30000,
            max: 1
        });
        if (!msgs.size) {
            client.games.delete(message.channel.id);
            return message.reply(stripIndents`
                no response? :D
                1.\`${formatNumber(data.option1_total)}\` - 2.\`${formatNumber(data.option2_total)}\`
            `);
        }
        const option1 = msgs.first().content.toLowerCase() === '1';
        await postResponse(data.id, option1);
        const totalVotes = Number.parseInt(data.option1_total, 10) + Number.parseInt(data.option2_total, 10);
        const numToUse = option1 ? Number.parseInt(data.option1_total, 10) : Number.parseInt(data.option2_total, 10);
        client.games.delete(message.channel.id);
        return message.reply(stripIndents`
            **${Math.round((numToUse / totalVotes) * 100)}%** of people agree with that!
            1.\`${formatNumber(data.option1_total)}\` - 2.\`${formatNumber(data.option2_total)}\`
        `);
    } catch (err) {
        client.games.delete(message.channel.id);
        return message.reply(`sorry :( i got an error. try again later!`);
    }
}

async function fetchScenario() {
    const { text } = await request.get('http://either.io/');
    return JSON.parse(text.match(/window.initial_question = (\{.+\})/)[1]).question;
}

async function postResponse(id, bool) {
    try {
        const { text } = await request
            .get(`http://either.io/vote/${id}/${bool ? '1' : '2'}`)
            .set({ 'X-Requested-With': 'XMLHttpRequest' });
        return JSON.parse(text).result;
    } catch {
        return false;
    }
}

exports.help = {
	name: "would-you-rather",
	description: `responds with a random "would you rather ...?" question.`,
	usage: "would-you-rather",
	example: "would-you-rather"
};
  
exports.conf = {
    aliases: ['wouldyourather', 'wyr'],
    cooldown: 5,
    guildOnly: true
};