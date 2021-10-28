const { SlashCommandBuilder } = require('@discordjs/builders');
const shipCmd = require('./rate/ship');
const friendshipCmd = require('./rate/friendship.js');
const ppCmd = require('./rate/pp');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'ship':
            shipCmd.run(client, interaction);
            break;
        case 'friendship':
            friendshipCmd.run(client, interaction);
            break;
        case 'pp':
            ppCmd.run(client, interaction);
            break;
    };
};

exports.help = {
    name: "rate",
    description: "rate something",
    usage: ["rate ship `<@user1> <@user2>`", "rate pp `[@user]`"],
    example: ["rate ship `@someone @Egirl`", "rate pp `@Eft`"]
};

exports.conf = {
    channelPerms: ["EMBED_LINKS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('ship')
            .setDescription('ship you or two people together and calculate their matching rate')
            .addUserOption(option => option
                .setName('user1')
                .setRequired(true)
                .setDescription('the first user that you want to ship')
            )
            .addUserOption(option => option
                .setName('user2')
                .setRequired(false)
                .setDescription('the user that you want to ship with the first user in user1')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('friendship')
            .setDescription('calculate two people\'s friendship')
            .addUserOption(option => option
                .setName('user1')
                .setRequired(true)
                .setDescription('the first user that you want to calculate with')
            )
            .addUserOption(option => option
                .setName('user2')
                .setRequired(false)
                .setDescription('the user that you want to caclulate with the first user in user1')
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('pp')
            .setDescription("rate the length of your or others peepee")
            .addUserOption(option => option
                .setName('user')
                .setRequired(false)
                .setDescription("which user's peepee that you want to measure?")
            )
        ),
    cooldown: 3,
    guildOnly: true,
};