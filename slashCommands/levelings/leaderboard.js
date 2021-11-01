const { SlashCommandBuilder } = require('@discordjs/builders');
const cuddleCmd = require('./leaderboard/cuddle');
const hugCmd = require('./leaderboard/hug');
const kissCmd = require('./leaderboard/kiss');
const levelingCmd = require('./leaderboard/leveling');
const patCmd = require('./leaderboard/pat');
const richCmd = require('./leaderboard/richest');
const slapCmd = require('./leaderboard/slap');
const punchCmd = require('./leaderboard/punch');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'cuddle':
            cuddleCmd.run(client, interaction);
            break;
        case 'hug':
            hugCmd.run(client, interaction);
            break;
        case 'kiss':
            kissCmd.run(client, interaction);
            break;
        case 'leveling':
            levelingCmd.run(client, interaction);
            break;
        case 'pat':
            patCmd.run(client, interaction);
            break;
        case 'rich':
            richCmd.run(client, interaction);
            break;
        case 'slap':
            slapCmd.run(client, interaction);
            break;
        case 'punch':
            punchCmd.run(client, interaction);
            break;
    }
}
exports.help = {
    name: "leaderboard",
    description: "display avaliable leaderboard for the server",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('cuddle')
            .setDescription("display a leaderboard of everyone's cuddle count")
        )
        .addSubcommand(sub => sub
            .setName('hug')
            .setDescription("display the guild's hug leaderboard")
        )
        .addSubcommand(sub => sub
            .setName('kiss')
            .setDescription("display the guild's kiss leaderboard")
        )
        .addSubcommand(sub => sub
            .setName('leveling')
            .setDescription("show the guild's leveling leaderboard")
        )
        .addSubcommand(sub => sub
            .setName('pat')
            .setDescription("display the guild's pat leaderboard")
        )
        .addSubcommand(sub => sub
            .setName('punch')
            .setDescription("display the guild's punch leaderboard")
        )
        .addSubcommand(sub => sub
            .setName('slap')
            .setDescription("display the guild's slap leaderboard")
        )
        .addSubcommand(sub => sub
            .setName('richest')
            .setDescription("show the leaderboard of people that have the most token in this server 💰")
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};