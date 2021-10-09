const { SlashCommandBuilder } = require('@discordjs/builders');
const catifyCmd = require('./text/catify');
const owoCmd = require('./text/owo');
const spoilerCmd = require('./text/spoiler');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'catify':
            catifyCmd.run(client, interaction);
            break;
        case 'owo':
            owoCmd.run(client, interaction);
            break;
        case 'spoiler':
            spoilerCmd.run(client, interaction);
            break;
    }
};
exports.help = {
    name: "text",
    description: "provides a variety of way to style your text",
    usage: ["text `<sub command> <text>`"],
    example: ["text `owo hello`"]
};

exports.conf = {
    guild: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('catify')
            .setDescription('transfrom your text or the message above yours to one that sounds like a cat 🤔')
            .addStringOption(option => option
                .setName('text')
                .setRequired(false)
                .setDescription('what do you want to say?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('owo')
            .setDescription("owoify your text or the message above yours? 🤔")
            .addStringOption(option => option
                .setName('text')
                .setRequired(false)
                .setDescription('what do you want to say?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('spoiler')
            .setDescription("transform your text into spoilers 🙃")
            .addStringOption(option => option
                .setName('text')
                .setRequired(true)
                .setDescription('what text would you like to transfrom?')
            )
        ),
    cooldown: 3,
    guildOnly: true,
};