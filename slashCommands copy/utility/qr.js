const { SlashCommandBuilder } = require('@discordjs/builders');
const genCmd = sync.require('./qr/generate');
const readCmd = sync.require('./qr/reader');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'generate':
            genCmd.run(client, interaction);
            break;
        case 'read':
            readCmd.run(client, interaction);
            break;
    };
};

exports.help = {
    name: "qr",
    description: "some functionality to help you with QR code",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('read')
            .setDescription("read a QR code from an image URL")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the QR code image URL that you want to use (fallback to nearest image if none provided)')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('generate')
            .setDescription("generate a QR code from either a text or URL you given")
            .addStringOption(option => option
                .setName('text')
                .setRequired(true)
                .setDescription('the text that you would like to use')
            )
        ),
    cooldown: 4,
    guildOnly: true,
};