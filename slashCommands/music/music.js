const youtubeSuggest = require("youtube-suggest");
const debugCmd = sync.require('./music/debug');
const disconnectCmd = sync.require('./music/disconnect');
const fskipCmd = sync.require('./music/force-skip');
const loopCmd = sync.require('./music/loop');
const lyricsCmd = sync.require('./music/lyrics');
const moveCmd = sync.require('./music/move');
const npCmd = sync.require('./music/now-playing');
const pauseCmd = sync.require('./music/pause');
const playCmd = sync.require('./music/play');
const playlistCmd = sync.require('./music/playlist');
const queueCmd = sync.require('./music/queue');
const removeCmd = sync.require('./music/remove');
const repeatCmd = sync.require('./music/repeat');
const resumeCmd = sync.require('./music/resume');
const searchCmd = sync.require('./music/search');
const seekCmd = sync.require('./music/seek');
const shuffleCmd = sync.require('./music/shuffle');
const skipToCmd = sync.require('./music/skip-to');
const stopCmd = sync.require('./music/stop');
const volumeCmd = sync.require('./music/volume');
const skipCmd = sync.require('./music/skip');
const { SlashCommandBuilder } = require("@discordjs/builders");

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'debug':
            debugCmd.run(client, interaction);
            break;
        case 'disconnect':
            disconnectCmd.run(client, interaction);
            break;
        case 'force-skip':
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to forcefully modify the queue :pensive:`, ephemeral: true });
            fskipCmd.run(client, interaction);
            break;
        case 'loop':
            loopCmd.run(client, interaction);
            break;
        case 'lyrics':
            lyricsCmd.run(client, interaction);
            break;
        case 'move':
            moveCmd.run(client, interaction);
            break;
        case 'now-playing':
            npCmd.run(client, interaction);
            break;
        case 'pause':
            pauseCmd.run(client, interaction);
            break;
        case 'play':
            playCmd.run(client, interaction);
            break;
        case 'playlist':
            playlistCmd.run(client, interaction);
            break;
        case 'queue':
            queueCmd.run(client, interaction);
            break;
        case 'remove':
            removeCmd.run(client, interaction);
            break;
        case 'repeat':
            repeatCmd.run(client, interaction);
            break;
        case 'resume':
            resumeCmd.run(client, interaction);
            break;
        case 'search':
            searchCmd.run(client, interaction);
            break;
        case 'seek':
            seekCmd.run(client, interaction);
            break;
        case 'shuffle':
            shuffleCmd.run(client, interaction);
            break;
        case 'skip-to':
            skipToCmd.run(client, interaction);
            break;
        case 'stop':
            stopCmd.run(client, interaction);
            break;
        case 'volume':
            volumeCmd.run(client, interaction);
            break;
        case 'skip':
            skipCmd.run(client, interaction);
            break;
    }
};

exports.suggestion = async(interaction) => {
    const query = interaction.options.getFocused();
    if (!query) return interaction.respond([]);
    const res = await youtubeSuggest(query);
    if (!res.length) return interaction.respond([]);
    return interaction.respond(res.map(each => {
        return {
            name: each,
            value: each
        }
    }))
};

exports.help = {
    name: "music",
    description: "stream music right from Discord from a variety of sources!",
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
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub => sub
        .setName('playlist')
        .setDescription("play an entire playlist or album from a URL or search query (lots of source supported)")
        .addStringOption(option => option
            .setName('query')
            .setDescription('what would you want to play?')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub => sub
        .setName('queue')
        .setDescription("display the music queue that i'm playing")
    )
    .addSubcommand(sub => sub
        .setName('remove')
        .setDescription("remove one or many songs from the queue")
        .addStringOption(option => option
            .setName('index')
            .setDescription('index(es) of the song that you want to remove in the queue (for example: 1 or 2, 3, 7)')
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
            .setAutocomplete(true)
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
        .setName('skip')
        .setDescription(`skip the currently playing song`)
    )
    .addSubcommand(sub => sub
        .setName('stop')
        .setDescription(`stop the music and clear the queue`)
    )
    .addSubcommand(sub => sub
        .setName('volume')
        .setDescription("change the volume of the current queue")
        .addIntegerOption(option => option
            .setMinValue(0)
            .setMaxValue(100)
            .setName('amount')
            .setDescription('the amount of volume that you want to set')
            .setRequired(false)
        )
    ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};