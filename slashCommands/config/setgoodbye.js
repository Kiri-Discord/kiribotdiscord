const { SlashCommandBuilder } = require('@discordjs/builders');
const offCmd = require('./goodbye/off');
const channelCmd = require('./goodbye/channel');
const contentCmd = require('./goodbye/content');
const testCmd = require('./goodbye/test');

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
    name: "setgoodbye",
    description: "setup the goodbye feature for leaving members",
    usage: ["setgoodbye `channel <#channel>`", "setgoodbye `test`", "setgoodbye `content`", "setgoodbye off"],
    example: ["setgoodbye `channel #logs`", "setgoodbye `test`", "setgoodbye `content`", "setgoodbye off"]
};

exports.conf = {
    guild: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('off')
            .setDescription('turn off the goodbye feature')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('channel')
            .setDescription('set the channel for goodbye message')
            .addChannelOption(option => option
                .setName('destination')
                .setRequired(true)
                .setDescription('where would you like to send the goodbye message to?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('content')
            .setDescription('edit the content of the goodbye message')
            .addStringOption(option => option
                .setName('type')
                .setDescription('what is the type of your goodbye message')
                .setRequired(true)
                .addChoice('plain text', 'plain')
                .addChoice('embed', 'embed')
            )
            .addStringOption(option => option
                .setName('content')
                .setDescription('set content for your goodbye message. if the type is embed, this will be the ID of the embed')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('test')
            .setDescription('send a test goodbye message')
        ),
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};