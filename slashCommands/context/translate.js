const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed } = require('discord.js');
const translate = require('@vitalets/google-translate-api');
const language = require('../../assets/language.json');
const { shorten } = require('../../util/util');

exports.run = async(client, interaction) => {
    const message = interaction.options.getMessage('message');
    if (!message.content) return interaction.reply({ content: "hold on... that message's content is empty! can you choose another?", ephemeral: true });
    const query = message.content;
    if (query.length > 1900) return interaction.reply({ content: "sorry, your text can't be longer than 1900 character :pensive:", ephemeral: true });

    try {
        await interaction.deferReply();
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
    name: "Translate message",
    description: "translate a defined text to English"
};

exports.conf = {
    data: new ContextMenuCommandBuilder()
        .setType(ApplicationCommandType.Message)
        .setName(exports.help.name),
    cooldown: 4,
    channelPerms: ["EMBED_LINKS"],
    context: true
};