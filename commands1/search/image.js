const DDG = require('duck-duck-scrape');
const { cleanAnilistHTML } = require('../../util/util');
const { MessageEmbed } = require("discord.js")

exports.run = async(client, message, args) => {
    let query = args.join(" ");
    if (!query) return message.reply("please enter something so i can search 👀");
    try {
        const searchResults = await DDG.searchImages(query, {
            safeSearch: message.channel.nsfw ? DDG.SafeSearchType.OFF : DDG.SafeSearchType.MODERATE
        });
        if (searchResults.noResults) return message.channel.send({
            embeds: [{
                description: `i can't find any result ;-;`,
            }]
        });
        const result = searchResults.results[0];
    
        const embed = new MessageEmbed()
            .setTitle(cleanAnilistHTML(result.title))
            .setURL(result.url)
            .setColor(message.guild.me.displayHexColor)
            .setImage(result.image)
            .setFooter({text: 'DuckDuckGo', iconURL: 'http://assets.stickpng.com/images/5847f32fcef1014c0b5e4877.png'})
        return message.channel.send({ embeds: [embed] });
    } catch {
        return message.channel.send({
            embeds: [{
                description: `i can't find any result ;-;`,
            }]
        });
    }
};
exports.help = {
    name: "image",
    description: "lookup an image online for your query",
    usage: ["image `<query>`"],
    example: ["image `cat`"]
};

exports.conf = {
    aliases: ["img"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};