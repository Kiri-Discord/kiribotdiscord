const DDG = require('duck-duck-scrape');
const { cleanAnilistHTML } = require('../../util/util');
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

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
exports.help = {
    name: "image",
    description: "lookup an image online for your query",
    usage: ["image `<query>`"],
    example: ["image `cat`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('query')
            .setRequired(true)
            .setDescription('what image would you like to search for?')
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};