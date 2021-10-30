const DDG = require('duck-duck-scrape');
const { cleanAnilistHTML } = require('../../util/util');
const { MessageEmbed } = require("discord.js");
const request = require("node-superfetch");

exports.run = async(client, interaction) => {
    let query = interaction.options.getString('query');
    await interaction.deferReply();
    const searchResults = await DDG.searchImages(query, {
        safeSearch: interaction.channel.nsfw ? DDG.SafeSearchType.OFF : DDG.SafeSearchType.MODERATE
    });
    if (searchResults.noResults) return interaction.editReply({
        embeds: [{
            description: `i can't find any result ;-;`,
        }]
    });
    const result = searchResults.results[0];

    const embed = new MessageEmbed()
        .setTitle(cleanAnilistHTML(result.title))
        .setURL(result.url)
        .setColor(interaction.guild.me.displayHexColor)
        .setImage(result.image)
        .setFooter('DuckDuckGo', 'http://assets.stickpng.com/images/5847f32fcef1014c0b5e4877.png', 'https://duckduckgo.com/')
    return interaction.editReply({ embeds: [embed] });
};


exports.suggestion = async(interaction) => {
    const query = interaction.options.getFocused();
    if (!query || query === '') return interaction.respond([]);
    const { text } = await request
        .get('https://suggestqueries.google.com/complete/search')
        .query({
            client: 'firefox',
            q: query
        });
    const data = JSON.parse(text)[1];
    if (!data.length) return interaction.respond([]);
    interaction.respond(data.map(each => {
        return {
            name: each,
            value: each
        }
    }))
};

exports.help = {
    name: "image",
    description: "lookup an image online for your query",
    usage: ["image `<query>`"],
    example: ["image `cat`"]
};

exports.conf = {
    data: {
        name: exports.help.name,
        description: exports.help.description,
        options: [{
            type: 3,
            name: "query",
            description: "what image would you like to search for?",
            required: true,
            autocomplete: true
        }]
    },
    guild: true,
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    rawData: true
};