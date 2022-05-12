const { SlashCommandBuilder } = require('@discordjs/builders');
const achievementCmd = sync.require('./memegen/achievement');
const beautifulCmd = sync.require('./memegen/beautiful');
const bobCmd = sync.require('./memegen/bob-ross');
const brazzersCmd = sync.require('./memegen/brazzers');
const classicCmd = sync.require('./memegen/classic-meme');
const contrastCmd = sync.require('./memegen/contrast');
const deepFryCmd = sync.require('./memegen/deepfry');
const desaturateCmd = sync.require('./memegen/desaturate');
const distortCmd = sync.require('./memegen/distort');
const ejectCmd = sync.require('./memegen/eject');
const fishEyeCmd = sync.require('./memegen/fisheye');
const greyscaleCmd = sync.require('./memegen/greyscale');
const ifearnoman = sync.require('./memegen/i-fear-no-man');
const invertCmd = sync.require('./memegen/invert');
const modernCmd = sync.require('./memegen/modern-meme');
const pixelizeCmd = sync.require('./memegen/pixelize');
const steamCmd = sync.require('./memegen/steam-playing');
const subtitleCmd = sync.require('./memegen/subtitle');
const timeCmd = sync.require('./memegen/time-card');
const petCmd = sync.require('./memegen/pet');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'achievement':
            achievementCmd.run(client, interaction);
            break;
        case 'beautiful':
            beautifulCmd.run(client, interaction);
            break;
        case 'bob-ross':
            bobCmd.run(client, interaction);
            break;
        case 'brazzers':
            brazzersCmd.run(client, interaction);
            break;
        case 'classic-meme':
            classicCmd.run(client, interaction);
            break;
        case 'contrast':
            contrastCmd.run(client, interaction);
            break;
        case 'deepfry':
            deepFryCmd.run(client, interaction);
            break;
        case 'desaturate':
            desaturateCmd.run(client, interaction);
            break;
        case 'distort':
            distortCmd.run(client, interaction);
            break;
        case 'eject':
            ejectCmd.run(client, interaction);
            break;
        case 'fisheye':
            fishEyeCmd.run(client, interaction);
            break;
        case 'greyscale':
            greyscaleCmd.run(client, interaction);
            break;
        case 'i-fear-no-man':
            ifearnoman.run(client, interaction);
            break;
        case 'invert':
            invertCmd.run(client, interaction);
            break;
        case 'modern-meme':
            modernCmd.run(client, interaction);
            break;
        case 'pixelize':
            pixelizeCmd.run(client, interaction);
            break;
        case 'steam-playing':
            steamCmd.run(client, interaction);
            break;
        case 'subtitle':
            subtitleCmd.run(client, interaction);
            break;
        case 'time-card':
            timeCmd.run(client, interaction);
            break;
        case 'pet':
            petCmd.run(client, interaction);
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
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the image URL that you want to use for this meme')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('bob-ross')
            .setDescription("turn your photo or avatar into one of Bob Ross's masterpieces")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('pet')
            .setDescription("pet an image that was sent or your avatar!")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('brazzers')
            .setDescription("you get the idea 👀")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
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
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('contrast')
            .setDescription("get more contrast to your image")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('deepfry')
            .setDescription("fry your photo on Discord!")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('desaturate')
            .setDescription("desaturate your image")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('distort')
            .setDescription("distort an image?")
            .addIntegerOption(option => option
                .setName('distort-level')
                .setDescription('how much distortion would you like to add for the meme?')
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
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
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('greyscale')
            .setDescription("is that blue? no, black.")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('i-fear-no-man')
            .setDescription("i fear no man, but that thing...")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('invert')
            .setDescription("so actually black just turned white and white turned black and black turned white and...")
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
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
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('pixelize')
            .setDescription("pixelize your image")
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
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
            .addUserOption(option => option
                .setName('avatar')
                .setDescription("the user's avatar that you want to use (confilct with url option)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('url')
                .setDescription('the optional image URL that you want to use')
                .setRequired(false)
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