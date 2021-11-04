const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'achievement':
            const achievementCmd = require('./memegen/achievement');
            achievementCmd.run(client, interaction);
            break;
        case 'beautiful':
            const beautifulCmd = require('./memegen/beautiful');
            beautifulCmd.run(client, interaction);
            break;
        case 'bob-ross':
            const bobCmd = require('./memegen/bob-ross');
            bobCmd.run(client, interaction);
            break;
        case 'brazzers':
            const brazzersCmd = require('./memegen/brazzers');
            brazzersCmd.run(client, interaction);
            break;
        case 'classic-meme':
            const classicCmd = require('./memegen/classic-meme');
            classicCmd.run(client, interaction);
            break;
        case 'contrast':
            const contrastCmd = require('./memegen/contrast');
            contrastCmd.run(client, interaction);
            break;
        case 'deepfry':
            const deepFryCmd = require('./memegen/deepfry');
            deepFryCmd.run(client, interaction);
            break;
        case 'desaturate':
            const desaturateCmd = require('./memegen/desaturate');
            desaturateCmd.run(client, interaction);
            break;
        case 'distort':
            const distortCmd = require('./memegen/distort');
            distortCmd.run(client, interaction);
            break;
        case 'eject':
            const ejectCmd = require('./memegen/eject');
            ejectCmd.run(client, interaction);
            break;
        case 'fisheye':
            const fishEyeCmd = require('./memegen/fisheye');
            fishEyeCmd.run(client, interaction);
            break;
        case 'greyscale':
            const greyscaleCmd = require('./memegen/greyscale');
            greyscaleCmd.run(client, interaction);
            break;
        case 'i-fear-no-man':
            const ifearnoman = require('./memegen/i-fear-no-man');
            ifearnoman.run(client, interaction);
            break;
        case 'invert':
            const invertCmd = require('./memegen/invert');
            invertCmd.run(client, interaction);
            break;
        case 'modern-meme':
            const modernCmd = require('./memegen/modern-meme');
            modernCmd.run(client, interaction);
            break;
        case 'pixelize':
            const pixelizeCmd = require('./memegen/pixelize');
            pixelizeCmd.run(client, interaction);
            break;
        case 'steam-playing':
            const steamCmd = require('./memegen/steam-playing');
            steamCmd.run(client, interaction);
            break;
        case 'subtitle':
            const subtitleCmd = require('./memegen/subtitle');
            subtitleCmd.run(client, interaction);
            break;
        case 'time-card':
            const cmd = require('./memegen/time-card');
            cmd.run(client, interaction);
            break;
    }
}
exports.help = {
    name: "memegen",
    description: "memeify everything",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('achievement')
            .setDescription("generate a Minecraft achievement notification 😛")
            .addStringOption(option => option
                .setName('text')
                .setDescription('what achievement do you want to get?')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('beautiful')
            .setDescription("generate a beautiful meme")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('bob-ross')
            .setDescription("turn your photo or avatar into one of Bob Ross's masterpieces")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('brazzers')
            .setDescription("you get the idea 👀")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('classic-meme')
            .setDescription("generate a classic meme with text and photo of your liking")
            .addStringOption(option => option
                .setName('top-text')
                .setDescription("what should the top text of the meme be?")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('bottom-text')
                .setDescription("what should the bottem text of the meme be?")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('contrast')
            .setDescription("get more contrast to your image ")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('deepfry')
            .setDescription("fry your photo on Discord!")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('desaturate')
            .setDescription("desaturate your image")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('distort')
            .setDescription("distort an image?")
            .addIntegerOption(option => option
                .setName('distort-level')
                .setDescription('how much distortion would you like to add for the meme?')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('eject')
            .setDescription("eject someone off the ship")
            .addUserOption(option => option
                .setName('target')
                .setDescription('who would you want to eject?')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('fisheye')
            .setDescription("transform your image into fisheyes?")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('greyscale')
            .setDescription("is that blue? no, black.")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('i-fear-no-man')
            .setDescription("i fear no man, but that thing...")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('invert')
            .setDescription("so actually black just turned white and white turned black and black turned white and...")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('modern-meme')
            .setDescription("generate a modern meme with text and photo of your liking")
            .addStringOption(option => option
                .setName('text')
                .setDescription("what should top text of the meme be?")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('pixelize')
            .setDescription("pixelize your image")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('steam-playing')
            .setDescription(`generate a Steam "Now Playing" notification.`)
            .addStringOption(option => option
                .setName('game')
                .setDescription('what game would you want to display?')
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName('user')
                .setDescription('who would you want to display in the notification?')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('subtitle')
            .setDescription(`add subtitle to your image`)
            .addStringOption(option => option
                .setName('text')
                .setDescription('what should the subtitle be?')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('time-card')
            .setDescription(`what is the text that you want to fill?`)
            .addStringOption(option => option
                .setName('text')
                .setDescription('what should the subtitle be?')
                .setRequired(true)
            )
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};