const { SlashCommandBuilder } = require('@discordjs/builders');
const timeoutCmd = require('./verify/timeout');
const setupCmd = require('./verify/setup');
const sendCmd = require('./verify/send');
const { ChannelType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
    const db = client.guildsStorage.get(interaction.guild.id);
    switch (interaction.options.getSubcommand()) {
        case 'disable':
            await interaction.deferReply();
            db.verifyChannelID = undefined;
            db.verifyRole = undefined;
            await client.dbguilds.findOneAndUpdate({
                guildID: interaction.guild.id,
            }, {
                verifyChannelID: null,
                verifyRole: null
            })
            interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ verify feature has been disabled for all upcoming new members` }] });
            break;
        case 'timeout':
            timeoutCmd.run(client, interaction, db);
            break;
        case 'setup':
            setupCmd.run(client, interaction, db)
            break;
        case 'send':
            sendCmd.run(client, interaction, db);
            break;
    };
};

exports.help = {
    name: "verify",
    description: "setup my verification system that intergrate with Google reCAPTCHA",
    usage: ["verify `setup <#channel> <@role>`", "verify `disable`", "verify `send`", "verify `timeout <timeout>`"],
    example: ["verify `setup #verify @Verify`", "verify `disable`", "verify `send`", "verify `timeout 1h`"]
};

exports.conf = {
    cooldown: 5,
    guildOnly: true,
    guild: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('setup')
            .setDescription('begin setting up the verify feature')
            .addChannelOption(option => option
                .setName('channel')
                .setRequired(true)
                .setDescription('set the verification guiding channel')
                .addChannelType(ChannelType.GuildText)
            )
            .addRoleOption(option => option
                .setRequired(true)
                .setName('role')
                .setDescription('what is the role that you want to give to verified members?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('disable')
            .setDescription('disable verification completely')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('send')
            .setDescription('send the guiding message to the verification channel')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('timeout')
            .setDescription('set the timeout duration that allow unverified members to stay and verify before they are kicked.')
            .addStringOption(option => option
                .setName('timeout')
                .setRequired(true)
                .setDescription('what will be the timeout duration? (all valid time format are s, m, hrs!)')
            )
            .addBooleanOption(option => option
                .setRequired(false)
                .setName('disable')
                .setDescription('weather you want or not to disable the kick timeout'))),
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"],
    clientPerms: ["MANAGE_ROLES"]
};