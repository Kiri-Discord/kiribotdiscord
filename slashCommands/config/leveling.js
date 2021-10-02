const { SlashCommandBuilder } = require('@discordjs/builders');

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
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('send')
            .setDescription('send the guiding message to the verification channel')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('timeout')
            .setDescription('set the timeout duration that allow unverified members to stay and verify before they are kicked.')
            .addStringOption(option => option
                .setName('timeout')
                .setRequired(true)
                .setDescription('what will be the timeout duration? (all valid time format are s, m, hrs!)')
            )),
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};