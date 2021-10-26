const { SlashCommandBuilder } = require('@discordjs/builders');
const achievementCmd = require('./music/achievement');
const beautifulCmd = require('./music/beautiful');
const bobCmd = require('./music/bob-ross');
const brazzersCmd = require('./music/brazzers');
const classicCmd = require('./music/classic-meme');
const contrastCmd = require('./music/contrast');
const deepFryCmd = require('./music/deepfry');
const desaturateCmd = require('./music/desaturate');
const distortCmd = require('./music/distort');
const ejectCmd = require('./music/eject');
const fishEyeCmd = require('./music/fisheye');
const greyscaleCmd = require('./music/greyscale');
const ifearnoman = require('./music/i-fear-no-man');
const invertCmd = require('./music/invert');
const modernCmd = require('./music/modern-meme');
const pixelizeCmd = require('./music/pixelize');
const steamCmd = require('./music/steam-playing');
const subtitleCmd = require('./music/subtitle');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'disconnect':
            achievementCmd.run(client, interaction);
            break;
        case 'force-skip':
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to forcefully modify the queue :pensive:`, ephemeral: true });
            beautifulCmd.run(client, interaction);
            break;
        case 'loop':
            bobCmd.run(client, interaction);
            break;
        case 'lyrics':
            brazzersCmd.run(client, interaction);
            break;
        case 'move':
            classicCmd.run(client, interaction);
            break;
        case 'now-playing':
            contrastCmd.run(client, interaction);
            break;
        case 'pause':
            deepFryCmd.run(client, interaction);
            break;
        case 'play':
            desaturateCmd.run(client, interaction);
            break;
        case 'playlist':
            distortCmd.run(client, interaction);
            break;
        case 'queue':
            ejectCmd.run(client, interaction);
            break;
        case 'remove':
            fishEyeCmd.run(client, interaction);
            break;
        case 'repeat':
            greyscaleCmd.run(client, interaction);
            break;
        case 'resume':
            ifearnoman.run(client, interaction);
            break;
        case 'search':
            invertCmd.run(client, interaction);
            break;
        case 'seek':
            modernCmd.run(client, interaction);
            break;
        case 'shuffle':
            pixelizeCmd.run(client, interaction);
            break;
        case 'skip-to':
            steamCmd.run(client, interaction);
            break;
        case 'stop':
            subtitleCmd.run(client, interaction);
            break;
        case 'volume':
            volumeCmd.run(client, interaction);
            break;
    }
}
exports.help = {
    name: "music",
    description: "stream music right from Discord!",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('disconnect')
            .setDescription("disconnect from the current music voice channel and clear the queue")
        )
        .addSubcommand(sub => sub
            .setName('force-skip')
            .setDescription("skip the currently playing song forcefully")
        )
        .addSubcommand(sub => sub
            .setName('loop')
            .setDescription("loop the entire queue")
        )
        .addSubcommand(sub => sub
            .setName('lyrics')
            .setDescription("get the lyrics for a song")
            .addStringOption(option => option
                .setName('song')
                .setDescription('the name of song do you want me to search the lyric for')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('move')
            .setDescription("move the current playing song around in the queue")
            .addIntegerOption(option => option
                .setName('from')
                .setDescription("what is the index of the song that you want to move?")
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('to')
                .setDescription("where would you want to move it?")
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('debug')
            .setDescription("turn on debugging mode for the current queue")
        )
        .addSubcommand(sub => sub
            .setName('now-playing')
            .setDescription("display the status of the current playing song")
        )
        .addSubcommand(sub => sub
            .setName('pause')
            .setDescription("pause a playing song")
        )
        .addSubcommand(sub => sub
            .setName('play')
            .setDescription("play a song from a URL or from search query (lots of source supported!)")
            .addStringOption(option => option
                .setName('query')
                .setDescription('what would you want to play?')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('playlist')
            .setDescription("play an entire playlist or album from a URL or search query (lots of source supported)")
            .addStringOption(option => option
                .setName('query')
                .setDescription('what would you want to play?')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('queue')
            .setDescription("display the music queue that i'm playing")
        )
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription("remove a song from the queue")
            .addIntegerOption(option => option
                .setName('index')
                .setDescription('the index of the song that you want to remove in the queue')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('repeat')
            .setDescription("repeat the currently playing song")
        )
        .addSubcommand(sub => sub
            .setName('resume')
            .setDescription("resume a previously paused song")
        )
        .addSubcommand(sub => sub
            .setName('search')
            .setDescription("search a songs to play from (avaliable for YouTube and SoundCloud)")
            .addStringOption(option => option
                .setName('query')
                .setDescription('what song would you want to search?')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('seek')
            .setDescription(`seek to a certain point of the song`)
            .addStringOption(option => option
                .setName('timestamp')
                .setDescription('where would you want to seek to? (for example 04:05 or 2m 6s)')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('shuffle')
            .setDescription(`shuffle the current queue`)
        )
        .addSubcommand(sub => sub
            .setName('skip-to')
            .setDescription("skip to the selected song in the queue")
            .addIntegerOption(option => option
                .setName('index')
                .setDescription('the index of the song that you want to skip to')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('stop')
            .setDescription(`stop the music and clear the queue`)
        )
        .addSubcommand(sub => sub
            .setName('volume')
            .setDescription("change the volume of the current queue")
            .addIntegerOption(option => option
                .setName('amount')
                .setDescription('the amount of volume that you want to set')
                .setRequired(true)
            )
        ),
    guild: true,
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};