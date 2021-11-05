const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'reset':
            const resetCmd = require('./filter/reset');
            resetCmd.run(client, interaction);
            break;
        case 'bassboost':
            const bassboostCmd = require('./filter/bassboost');
            bassboostCmd.run(client, interaction);
            break;
        case 'earrape':
            const earrapeCmd = require('./filter/earrape');
            earrapeCmd.run(client, interaction);
            break;
        case 'nightcore':
            const nightcoreCmd = require('./filter/nightcore');
            nightcoreCmd.run(client, interaction);
            break;
        case 'vaporwave':
            const vaporwaveCmd = require('./filter/vaporwave');
            vaporwaveCmd.run(client, interaction);
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