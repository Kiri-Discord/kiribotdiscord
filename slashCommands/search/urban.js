const urban = require("relevant-urban");
const { MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    let result;
    let query = interaction.options.getString('word');

    try {
        await interaction.deferReply();
        result = await urban(query);
    } catch (error) {
        return interaction.editReply(`i can't find definition for the word phrase of **${query}** :pensive:`);
    };

    const embed = new MessageEmbed()
        .setTimestamp(new Date())
        .setColor("#7DBBEB")
        .setTitle(result.word)
        .setURL(result.urbanURL)
        .setDescription(`**Definition:** \n*${result.definition}* \n\n**Example:** \n*${result.example}*`)
        .addField("Author", result.author, true)
        .addField("Rating", `👍 ${result.thumbsUp.toLocaleString()} | 👎 ${result.thumbsDown.toLocaleString()}`)

    if (result.tags.length > 0 && result.tags.join(" ").length < 1024) {
        embed.addField("Tags", result.tags.join(", "), true);
    }
    return interaction.editReply({ embeds: [embed] });
};

exports.help = {
    name: "urban",
    description: "get the definition for a word in Urban Dictionary",
    usage: ["urban `<word>`"],
    example: ["urban `google`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('word')
            .setRequired(true)
            .setDescription('what word would you like to search?')
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};