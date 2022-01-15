const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
const { formatNumber } = require('../../util/util');
const questions = require('../../assets/google-feud');

exports.run = async(client, message, args) => {
    const question = args.join(" ") || questions[Math.floor(Math.random() * questions.length)];
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(current.prompt);
    client.games.set(message.channel.id, { prompt: `you should wait until **${message.author.username}** is finished first :(` });
    try {
        const suggestions = await fetchSuggestions(question);
        if (!suggestions) return message.channel.send('i could not find any results from the server. can you try again later? :pensive:');
        const display = new Array(suggestions.length).fill('???');
        let tries = 4;
        let score = 0;
        while (display.includes('???') && tries) {
            const embed = makeEmbed(question, tries, suggestions, display);
            await message.channel.send({ embeds: [embed] });
            const messages = await message.channel.awaitMessages({
                filter: res => res.author.id === message.author.id,
                max: 1,
                time: 30000
            });
            if (!messages.size) {
                await message.channel.send('Time is up!');
                break;
            }
            const choice = messages.first().content.toLowerCase();
            if (suggestions.includes(choice)) {
                score += 10000 - (suggestions.indexOf(choice) * 1000);
                display[suggestions.indexOf(choice)] = choice;
            } else {
                --tries;
            }
        }
        client.games.delete(message.channel.id);
        if (!display.includes('???')) {
            return message.channel.send(`you win! nice job, master of Google!\n**Final Score: $${formatNumber(score)}**`);
        }
        const final = makeEmbed(question, tries, suggestions, suggestions);
        return message.channel.send({
            embeds: [final],
            content: `better luck next time! **your score: $${formatNumber(score)}**`,
        });
    } catch (err) {
        client.games.delete(message.channel.id);
        return message.reply(`oh no, an error occurred :( try again later!`);
    };
};

async function fetchSuggestions(question) {
    const { text } = await request
        .get('https://suggestqueries.google.com/complete/search')
        .query({
            client: 'firefox',
            q: question
        });
    const suggestions = JSON.parse(text)[1]
        .filter(suggestion => suggestion.toLowerCase() !== question.toLowerCase());
    if (!suggestions.length) return null;
    return suggestions.map(suggestion => suggestion.toLowerCase().replace(question.toLowerCase(), '').trim());
};

function makeEmbed(question, tries, suggestions, display) {
    const embed = new MessageEmbed()
        .setTitle(`${question}...?`)
        .setDescription('type the choice that you guess is a suggestion for the question.')
        .setFooter({text: `${tries} ${tries === 1 ? 'try' : 'tries'} remaining!`});
    for (let i = 0; i < suggestions.length; i++) {
        const num = formatNumber(10000 - (i * 1000));
        embed.addField(`\`${i + 1}\` ${num}`, display[i], true);
    };
    return embed;
};

exports.help = {
    name: "autofill",
    description: "a game attempt to determine the top suggestions for a Google search.",
    usage: ["autofill `[question]`"],
    example: ["autofill `discord`", "autofill"]
};

exports.conf = {
    aliases: ["gg-autofill", "google-autofill"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};