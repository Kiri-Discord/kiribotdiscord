const { SlashCommandBuilder } = require('@discordjs/builders');
const offCmd = require('./greeting/off');
const channelCmd = require('./greeting/channel');
const contentCmd = require('./greeting/content');
const testCmd = require('./greeting/test');
const { ChannelType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
    const db = client.guildsStorage.get(interaction.guild.id);
    switch (interaction.options.getSubcommand()) {
        case 'off':
            offCmd.run(client, interaction, db);
            break;
        case 'channel':
            channelCmd.run(client, interaction, db);
            break;
        case 'content':
            contentCmd.run(client, interaction, db);
            break;
        case 'test':
            testCmd.run(client, interaction, db);
            break;
    };
};
exports.help = {
    name: "setgreetings",
    description: "setup the greeting feature for new members",
    usage: ["setgreetings `channel <#channel>`", "setgreetings `test`", "setgreetings `content`", "setgreetings off"],
    example: ["setgreetings `channel #logs`", "setgreetings `test`", "setgreetings `content`", "setgreetings off"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('off')
            .setDescription('turn off the greeting feature')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('channel')
            .setDescription('set the channel for greeting message')
            .addChannelOption(option => option
                .setName('destination')
                .setRequired(true)
                .setDescription('where would you like to send the greeting message to?')
                .addChannelType(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('content')
            .setDescription('edit the content of the greeting message')
            .addStringOption(option => option
                .setName('type')
                .setDescription('what is the type of your greeting message')
                .setRequired(true)
                .addChoice('plain text', 'plain')
                .addChoice('embed', 'embed')
            )
            .addStringOption(option => option
                .setName('content')
                .setDescription('set content for your greeting message. if the type is embed, this will be the ID of the embed')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('test')
            .setDescription('send a test greeting message')
        ),
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};