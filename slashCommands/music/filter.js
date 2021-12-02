const { SlashCommandBuilder } = require('@discordjs/builders');
const resetCmd = sync.require('./filter/reset');
const bassboostCmd = sync.require('./filter/bassboost');
const earrapeCmd = sync.require('./filter/earrape');
const nightcoreCmd = sync.require('./filter/nightcore');
const vaporwaveCmd = sync.require('./filter/vaporwave');
const speedCmd = sync.require('./filter/speed');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'reset':
            resetCmd.run(client, interaction);
            break;
        case 'bassboost':
            bassboostCmd.run(client, interaction);
            break;
        case 'earrape':
            earrapeCmd.run(client, interaction);
            break;
        case 'nightcore':
            nightcoreCmd.run(client, interaction);
            break;
        case 'vaporwave':
            vaporwaveCmd.run(client, interaction);
            break;
        case 'speed':
            speedCmd.run(client, interaction);
            break;
    }
}

exports.help = {
    name: "filter",
    description: "spice up the music by adding filter to your playing song! require an effect ticket.",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('reset')
            .setDescription("reset all applied music filter")
        )
        .addSubcommand(sub => sub
            .setName('bassboost')
            .setDescription("apply bassboost to your current music queue")
        )
        .addSubcommand(sub => sub
            .setName('earrape')
            .setDescription("apply earrape to your current music queue 😳")
        )
        .addSubcommand(sub => sub
            .setName('speed')
            .setDescription("speed up or slow down songs in the current queue")
            .addStringOption(option => option
                .setName('rate')
                .setDescription('what is the speed rate that you want to apply? (ranging from 0.1 to 2)')
                .setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('nightcore')
            .setDescription("apply nightcore to your current music queue")
        )
        .addSubcommand(sub => sub
            .setName('vaporwave')
            .setDescription("apply vaporwave to your current music queue 😔")
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};