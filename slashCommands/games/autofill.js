const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
const { formatNumber } = require('../../util/util');
const questions = require('../../assets/google-feud');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const question = interaction.options.getString('question') || questions[Math.floor(Math.random() * questions.length)];
    const current = client.games.get(interaction.channel.id);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
    client.games.set(interaction.channel.id, { prompt: `you should wait until **${interaction.user.username}** is finished first :(` });
    try {
        interaction.reply({ content: 'beginning the Autofill game...', ephemeral: true });
        const suggestions = await fetchSuggestions(question);
        if (!suggestions) return interaction.channel.send('i could not find any results from the server. can you try again later? :pensive:');
        const display = new Array(suggestions.length).fill('???');
        let tries = 4;
        let score = 0;
        while (display.includes('???') && tries) {
            const embed = makeEmbed(question, tries, suggestions, display);
            await interaction.channel.send({ embeds: [embed] });
            const messages = await interaction.channel.awaitMessages({
                filter: res => res.author.id === interaction.user.id,
                max: 1,
                time: 30000
            });
            if (!messages.size) {
                await interaction.channel.send('Time is up!');
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
        client.games.delete(interaction.channel.id);
        if (!display.includes('???')) {
            return interaction.channel.send(`you win! nice job, master of Google!\n**Final Score: $${formatNumber(score)}**`);
        }
        const final = makeEmbed(question, tries, suggestions, suggestions);
        return interaction.channel.send({
            embeds: [final],
            content: `better luck next time! **your score: $${formatNumber(score)}**`,
        });
    } catch (err) {
        client.games.delete(interaction.channel.id);
        return interaction.reply(`oh no, an error occurred :( try again later!`);
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
        .setFooter(`${tries} ${tries === 1 ? 'try' : 'tries'} remaining!`);
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
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('question')
            .setDescription('what question that you want to use for the game?')
            .setRequired(false)
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};