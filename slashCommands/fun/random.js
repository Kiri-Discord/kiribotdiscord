const { SlashCommandBuilder } = require('@discordjs/builders');
const eightBallCmd = sync.require('./random/8ball');
const adviceCmd = sync.require('./random/advice');
const factCmd = sync.require('./random/fact');
const jokeCmd = sync.require('./random/joke');
const questionCmd = sync.require('./random/question');
const quoteCmd = sync.require('./random/quote');
const praiseCmd = sync.require('./random/praise');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case '8ball':
            eightBallCmd.run(client, interaction);
            break;
        case 'advice':
            adviceCmd.run(client, interaction);
            break;
        case 'fact':
            factCmd.run(client, interaction);
            break;
        case 'joke':
            jokeCmd.run(client, interaction);
            break;
        case 'question':
            questionCmd.run(client, interaction);
            break;
        case 'quote':
            quoteCmd.run(client, interaction);
            break;
        case 'praise':
            praiseCmd.run(client, interaction);
            break;

    }
};
exports.help = {
    name: "random",
    description: "gives you a random respond for something",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('8ball')
            .setDescription('your life depends on this one.')
            .addStringOption(option => option
                .setName('question')
                .setRequired(true)
                .setDescription('what would you like to ask me?')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('praise')
            .setDescription("give you a free compliment ;)")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('advice')
            .setDescription("gives you a random advice")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('fact')
            .setDescription('gives you a random fact')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('joke')
            .setDescription('say a random joke')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('question')
            .setDescription('ask you a random question')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('quote')
            .setDescription('get a random quote from a famous person')
        ),
    cooldown: 3,
    guildOnly: true,
};