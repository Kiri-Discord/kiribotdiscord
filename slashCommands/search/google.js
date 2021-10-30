const { MessageEmbed } = require("discord.js")
const request = require("node-superfetch");
const DDG = require('duck-duck-scrape');
const { cleanAnilistHTML } = require('../../util/util');

exports.run = async(client, interaction) => {
    let googleKey = client.config.gg_key;
    let csx = client.config.csx_key;
    let query = interaction.options.getString('query');
    let safesearch;
    if (interaction.channel.nsfw) {
        safesearch = "off"
    } else {
        safesearch = "active"
    };
    await interaction.deferReply();
    const href = await search(googleKey, csx, query, safesearch);
    if (!href) {
        interaction.editReply({
            embeds: [{
                description: `i can't find any result ;-; falling back to Duck Duck Go...`,
            }]
        });
        const searchResults = await DDG.search(query, {
            safeSearch: interaction.channel.nsfw ? DDG.SafeSearchType.OFF : DDG.SafeSearchType.MODERATE
        });
        if (searchResults.noResults) return interaction.editReply({
            embeds: [{
                description: `i can't find any result there either :pensive:`,
            }]
        });
        const result = searchResults.results[0];

        const embed = new MessageEmbed()
            .setTitle(cleanAnilistHTML(result.title))
            .setDescription(cleanAnilistHTML(result.description))
            .setURL(result.url)
            .setColor(interaction.guild.me.displayHexColor)
            .setFooter(result.hostname, result.icon)
            .setAuthor('DuckDuckGo', 'http://assets.stickpng.com/images/5847f32fcef1014c0b5e4877.png', 'https://duckduckgo.com/')
        return interaction.editReply({ embeds: [embed] });
    };

    const embed = new MessageEmbed()
        .setTitle(href.title)
        .setDescription(href.snippet)
        .setURL(href.link)
        .setColor(interaction.guild.me.displayHexColor)
        .setFooter(href.displayLink)
        .setAuthor('Google', 'https://i.pinimg.com/originals/74/65/f3/7465f30319191e2729668875e7a557f2.png', 'https://google.com')
    if (href.pagemap.cse_image) {
        embed.setImage(href.pagemap.cse_image[0].src)
    };
    return interaction.editReply({ embeds: [embed] });
};


async function search(googleKey, csx, query, safesearch) {
    try {
        const { body } = await request.get("https://www.googleapis.com/customsearch/v1").query({
            key: googleKey,
            cx: csx,
            safe: safesearch,
            q: query
        });
        if (!body.items) {
            return null;
        } else if (Array.isArray(body.items)) {
            return body.items[0];
        } else {
            return body.items;
        }
    } catch (error) {
        return null;
    };
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
    name: "google",
    description: "search something for you on the web with Google",
    usage: ["google `<query>`"],
    example: ["google `discord`"]
};

exports.conf = {
    data: {
        name: exports.help.name,
        description: exports.help.description,
        options: [{
            type: 3,
            name: "query",
            description: "what would you like to search for?",
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