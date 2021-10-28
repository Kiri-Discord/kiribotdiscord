const { MessageEmbed } = require("discord.js");
const axios = require("axios").default;
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const query = interaction.options.getString('query').trim();
    await interaction.deferReply();

    const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36' };
    axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { headers }).then(res => {
        const article = res.data;

        const wikipedia = new MessageEmbed()
            .setColor(interaction.guild.me.displayHexColor)
            .setTitle(`**${article.title}**`)
            .setURL(article.content_urls.desktop.page)
            .setDescription(`> ${article.extract}`)
            .setThumbnail(article.originalimage ? article.originalimage.source : null)
            .setTimestamp(new Date())
        return interaction.editReply({ embeds: [wikipedia] });
    }).catch(() => interaction.editReply(`i found no article with the title "${query}" :pensive:`));
}

exports.help = {
    name: "wikipedia",
    description: "searches Wikipedia! right on Discord!",
    usage: ["wikipedia `<query>`"],
    example: ["wikipedia `One Piece`"]
}

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('query')
            .setRequired(true)
            .setDescription('the query that you want to search for on Wikipedia')
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}