const { MessageEmbed } = require('discord.js');
const translate = require('@vitalets/google-translate-api');
const language = require('../../assets/language.json');
const { shorten } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const query = interaction.options.getString('text');
    if (query.length > 1900) return interaction.reply({ content: "sorry, your text can't be longer than 1900 character :pensive:", ephemeral: true });
    await interaction.deferReply();
    try {
        const res = await translate(query, { to: 'en', from: 'auto' });
        const embed = new MessageEmbed()
            .setColor('#4A91E2')
            .setDescription(shorten(res.text, 4095))
            .setFooter({text: `From "${res.from.text.autoCorrected || res.from.text.didYouMean ? shorten(res.from.text.value, 1980) : query}" (${language[res.from.language.iso]})`})
        return interaction.editReply({ embeds: [embed] });
    } catch (err) {
        return interaction.editReply(`sorry, the server is overloaded! please try again later :pensive:`);
    };
};


exports.help = {
    name: "translate",
    description: "translate a defined text to English",
    usage: ["translate \`<text>\`"],
    example: ["translate \`bonjour\`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('text')
            .setDescription('the text which you want to translate')
            .setRequired(true)
        ),
    cooldown: 4,
    channelPerms: ["EMBED_LINKS"]
};