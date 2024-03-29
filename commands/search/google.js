const { MessageEmbed } = require("discord.js")
const request = require("node-superfetch");
const DDG = require('duck-duck-scrape');
const { cleanAnilistHTML } = require('../../util/util');

exports.run = async(client, message, args) => {
    let googleKey = client.config.gg_key;
    let csx = client.config.csx_key;
    let query = args.join(" ");
    if (!query) return message.reply("please enter something so i can search 👀");
    let safesearch;
    if (message.channel.nsfw) {
        safesearch = "off"
    } else {
        safesearch = "active"
    }
    const href = await search(googleKey, csx, query, safesearch);
    if (!href) {
        try {
            const searchResults = await DDG.search(query, {
                safeSearch: message.channel.nsfw ? DDG.SafeSearchType.OFF : DDG.SafeSearchType.MODERATE
            });
            if (searchResults.noResults) return message.channel.send({
                embeds: [{
                    description: `i can't find any result :pensive:`,
                }]
            });
            const result = searchResults.results[0];
    
            const embed = new MessageEmbed()
                .setTitle(cleanAnilistHTML(result.title))
                .setDescription(cleanAnilistHTML(result.description))
                .setURL(result.url)
                .setColor(message.guild.me.displayHexColor)
                .setFooter({text: result.hostname, iconURL: result.icon})
                .setAuthor({name: 'DuckDuckGo', iconURL: 'http://assets.stickpng.com/images/5847f32fcef1014c0b5e4877.png', url: 'https://duckduckgo.com/'})
            return message.channel.send({ embeds: [embed] });
        } catch {
            return message.channel.send({
                embeds: [{
                    description: `i can't find any result :pensive:`,
                }]
            });
        }
    };

    const embed = new MessageEmbed()
        .setTitle(href.title)
        .setDescription(href.snippet)
        .setURL(href.link)
        .setColor(message.guild.me.displayHexColor)
        .setFooter({text: href.displayLink})
        .setAuthor({name: 'Google', iconURL: 'https://i.pinimg.com/originals/74/65/f3/7465f30319191e2729668875e7a557f2.png', url: 'https://google.com'})
    if (href.pagemap && Array.isArray(href.pagemap.cse_image)) {
        embed.setImage(href.pagemap.cse_image[0].src)
    };
    return message.channel.send({ embeds: [embed] });
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

exports.help = {
    name: "google",
    description: "find something for you on the web with Google",
    usage: ["google `<query>`"],
    example: ["google `discord`"]
};

exports.conf = {
    aliases: ["gg"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};