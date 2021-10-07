const { SlashCommandBuilder } = require('@discordjs/builders');
const marryCmd = require('./marriage/marry');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'marry':

    }
}
exports.help = {
    name: "marriage",
    description: "allows marriage in your server (and earn some future benefits of course!)",
    usage: ["marriage `marry <@mention>`", "marriage `divorce <@mention>`", "marriage `status`"],
    example: ["marriage `marry @Discord`", "marriage `divorce @Jack`", "marriage `status`"]
};

exports.conf = {
    guild: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('marry')
            .setDescription('marry someone')
            .addUserOption(option => option
                .setName('user')
                .setRequired(true)
                .setDescription('who would you like to marry?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('status')
            .setDescription("check your or another person's relationship status")
            .addUserOption(option => option
                .setName('user')
                .setRequired(true)
                .setDescription('who would you like get the relationship status?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('divorce')
            .setDescription('divorce with someone you already married')
        ),
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};