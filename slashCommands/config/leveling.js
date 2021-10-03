const { SlashCommandBuilder } = require('@discordjs/builders');
const toggleCmd = require('./leveling/toggle');
const announceCmd = require('./leveling/announce');
const contentCmd = require('./leveling/content');
const ignoreCmd = require('./leveling/ignore');
const testCmd = require('./leveling/test');

exports.run = async(client, interaction) => {
    const db = client.guildsStorage.get(interaction.guild.id);
    switch (interaction.options.getSubcommand()) {
        case 'toggle':
            toggleCmd.run(client, interaction, db);
            break;
        case 'announce':
            announceCmd.run(client, interaction, db);
            break;
        case 'content':
            contentCmd.run(client, interaction, db);
            break;
        case 'ignore':
            ignoreCmd.run(client.interaction, db);
            break;
        case 'test':
            testCmd.run(client, interaction, db);
            break;
    };
};

exports.help = {
    name: "leveling",
    description: "toggle message leveling for your server",
    usage: ["leveling toggle [on | off]\`", "leveling `announce [#channel] [there]`", "leveling `content <embed | plain>`", "leveling `test`"],
    example: ["leveling \`enable on\`", "leveling \`enable off\`", "leveling `announce there`", "leveling `announce <#channel>`", "leveling `content embed`", "leveling `test`"]
};

exports.conf = {
    aliases: ["levelings", "toggleleveling"],
    cooldown: 4,
    guild: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('toggle')
            .setDescription('turn my message leveling system on or off throughout the server')
            .addStringOption(option => option
                .setName('toggle')
                .setDescription('do you want to turn it on or off?')
                .setRequired(true)
                .addChoice('on', 'on')
                .addChoice('off', 'off')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('announce')
            .setDescription('set the destination for leveling announcement message')
            .addStringOption(option => option
                .setName('there')
                .setDescription('do you want to send the annoucement message in the same channel? (this override every other option)')
                .setRequired(false)
                .addChoice('on', 'on')
                .addChoice('off', 'off')
            )
            .addChannelOption(option => option
                .setName('destination')
                .setRequired(false)
                .setDescription('where would you like to send the leveling message to?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('content')
            .setDescription('edit the content of the leveling message')
            .addStringOption(option => option
                .setName('type')
                .setDescription('what is the type of your leveling message?')
                .setRequired(true)
                .addChoice('plain text', 'plain')
                .addChoice('embed', 'embed')
            )
            .addStringOption(option => option
                .setName('content')
                .setDescription('set content for your leveling message. if the type is embed, this will be the ID of the embed')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('ignore')
            .setDescription('ignore a message channel from leveling up')
            .addChannelOption(option => option
                .setName('channel')
                .setRequired(true)
                .setDescription('what is the channel that you want to block user from leveling?')
            )
            .addBooleanOption(option => option
                .setName('disable')
                .setDescription('turn off the ignore rule completely for the current ingore channel (override every other option)')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('test')
            .setDescription('send a test leveling announcement message')
        ),
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};