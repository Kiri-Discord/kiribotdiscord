const { SlashCommandBuilder } = require('@discordjs/builders');
const bakaCmd = require('./actions/baka');
const cryCmd = require('./actions/cry');
const cuddleCmd = require('./actions/cuddle');
const feedCmd = require('./actions/feed');
const hugCmd = require('./actions/hug');
const kissCmd = require('./actions/kiss');
const patCmd = require('./actions/pat');
const pokeCmd = require('./actions/poke');
const punchCmd = require('./actions/punch');
const slapCmd = require('./actions/slap');
const smugCmd = require('./actions/smug');
const tickleCmd = require('./actions/tickle');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'baka':
            bakaCmd.run(client, interaction);
            break;
        case 'cry':
            cryCmd.run(client, interaction);
            break;
        case "cuddle":
            cuddleCmd.run(client, interaction);
            break;
        case 'feed':
            feedCmd.run(client, interaction);
            break;
        case 'hug':
            hugCmd.run(client, interaction);
            break;
        case 'kiss':
            kissCmd.run(client, interaction);
            break;
        case 'pat':
            patCmd.run(client, interaction);
            break;
        case 'poke':
            pokeCmd(client, interaction);
            break;
        case 'punch':
            punchCmd(client, interaction);
            break;
        case 'slap':
            slapCmd.run(client, interaction);
            break;
        case 'smug':
            smugCmd.run(client, interaction);
            break;
        case 'tickle':
            tickleCmd.run(client, interaction);
            break;
    }
};

exports.help = {
    name: "roleplay",
    description: "fun roleplay-like actions to interact with your friends and rank yourself up in the leaderboard!",
    usage: [
        "roleplay baka `<@user>`",
        "roleplay cry `<@user>`",
        "roleplay cuddle `<@user>`",
        "roleplay feed `<@user>`",
        "roleplay hug `<@user>`",
        "roleplay insult `<@user>`",
        "roleplay kiss `<@user>`",
        "roleplay pat`<@user>`",
        "roleplay poke `<@user>`",
        "roleplay punch `<@user>`",
        "roleplay slap `<@user>`",
        "roleplay smug `<@user>`",
        "roleplay tickle `<@user>`"
    ],
    example: []
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('baka')
            .setDescription('give a stupid presence to everyone 😕')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('cry')
            .setDescription('just let it all out 😔')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('cuddle')
            .setDescription('cuddle someone with care')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to cuddle?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('feed')
            .setDescription('feed someone full ❤️')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to feed?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('hug')
            .setDescription('hug somebody with care')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to hug?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('kiss')
            .setDescription('make her yours man.')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to kiss?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('pat')
            .setDescription('this is super duper self-explanatory')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to pat?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('poke')
            .setDescription('poke somebody')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to poke?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('punch')
            .setDescription('punch somebody in their face')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to punch?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('slap')
            .setDescription('slap someone with your best')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to slap?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('smug')
            .setDescription('smug on somebody 🤔')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('tickle')
            .setDescription('tickle somebody to death')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to tickle?')
            )
        ),
    cooldown: 3,
    guild: true,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};