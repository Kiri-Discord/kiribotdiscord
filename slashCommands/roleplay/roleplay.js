const { SlashCommandBuilder } = require('@discordjs/builders');
const bakaCmd = sync.require('./actions/baka');
const cryCmd = sync.require('./actions/cry');
const cuddleCmd = sync.require('./actions/cuddle');
const feedCmd = sync.require('./actions/feed');
const hugCmd = sync.require('./actions/hug');
const kissCmd = sync.require('./actions/kiss');
const patCmd = sync.require('./actions/pat');
const pokeCmd = sync.require('./actions/poke');
const punchCmd = sync.require('./actions/punch');
const slapCmd = sync.require('./actions/slap');
const smugCmd = sync.require('./actions/smug');
const tickleCmd = sync.require('./actions/tickle');

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
            pokeCmd.run(client, interaction);
            break;
        case 'punch':
            punchCmd.run(client, interaction);
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
    usage: [],
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
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('feed')
            .setDescription('feed someone full ❤️')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to feed?')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('hug')
            .setDescription('hug somebody with care')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to hug?')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('kiss')
            .setDescription('make her yours man.')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to kiss?')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('pat')
            .setDescription('this is super duper self-explanatory')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to pat?')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('poke')
            .setDescription('poke somebody')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to poke?')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('punch')
            .setDescription('punch somebody in their face')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to punch?')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('slap')
            .setDescription('slap someone with your best')
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you like to slap?')
                .setRequired(true)
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
                .setRequired(true)
            )
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};