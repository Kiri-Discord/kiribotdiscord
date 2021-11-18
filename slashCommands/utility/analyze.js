const { SlashCommandBuilder } = require('@discordjs/builders');
const faceCmd = sync.require('./analyze/face');
const gnCmd = sync.require('./analyze/gender-guess');
const animeCmd = sync.require('./analyze/anime');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'face':
            faceCmd.run(client, interaction);
            break;
        case 'gender-guess':
            gnCmd.run(client, interaction);
            break;
        case 'anime':
            animeCmd.run(client, interaction);
            break;
    };
};

exports.help = {
    name: "analyze",
    description: "give you analysis base on context you given :)",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('face')
            .setDescription("give me a portrait and i will try to guess the race, gender, and age of that face 😄")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the image URL that you want to use for analyzing (fallback to nearest image if none provided)')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('anime')
            .setDescription("detect the anime from just a screenshot or a GIF :)")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the image URL that you want to use for analyzing (fallback to nearest image if none provided)')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('gender-guess')
            .setDescription("guess the gender of a person by their name")
            .addStringOption(option => option
                .setName('name')
                .setRequired(true)
                .setDescription('the name that you would like me to guess')
            )
        ),
    cooldown: 4,
    guildOnly: true,
};