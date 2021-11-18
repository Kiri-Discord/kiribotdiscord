const youtubeSuggest = require("youtube-suggest");

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'debug':
            const debugCmd = sync.require('./music/debug');
            debugCmd.run(client, interaction);
            break;
        case 'disconnect':
            const disconnectCmd = sync.require('./music/disconnect');
            disconnectCmd.run(client, interaction);
            break;
        case 'force-skip':
            const fskipCmd = sync.require('./music/force-skip');
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to forcefully modify the queue :pensive:`, ephemeral: true });
            fskipCmd.run(client, interaction);
            break;
        case 'loop':
            const loopCmd = sync.require('./music/loop');
            loopCmd.run(client, interaction);
            break;
        case 'lyrics':
            const lyricsCmd = sync.require('./music/lyrics');
            lyricsCmd.run(client, interaction);
            break;
        case 'move':
            const moveCmd = sync.require('./music/move');
            moveCmd.run(client, interaction);
            break;
        case 'now-playing':
            const npCmd = sync.require('./music/now-playing');
            npCmd.run(client, interaction);
            break;
        case 'pause':
            const pauseCmd = sync.require('./music/pause');
            pauseCmd.run(client, interaction);
            break;
        case 'play':
            const playCmd = sync.require('./music/play');
            playCmd.run(client, interaction);
            break;
        case 'playlist':
            const playlistCmd = sync.require('./music/playlist');
            playlistCmd.run(client, interaction);
            break;
        case 'queue':
            const queueCmd = sync.require('./music/queue');
            queueCmd.run(client, interaction);
            break;
        case 'remove':
            const removeCmd = sync.require('./music/remove');
            removeCmd.run(client, interaction);
            break;
        case 'repeat':
            const repeatCmd = sync.require('./music/repeat');
            repeatCmd.run(client, interaction);
            break;
        case 'resume':
            const resumeCmd = sync.require('./music/resume');
            resumeCmd.run(client, interaction);
            break;
        case 'search':
            const searchCmd = sync.require('./music/search');
            searchCmd.run(client, interaction);
            break;
        case 'seek':
            const seekCmd = sync.require('./music/seek');
            seekCmd.run(client, interaction);
            break;
        case 'shuffle':
            const shuffleCmd = sync.require('./music/shuffle');
            shuffleCmd.run(client, interaction);
            break;
        case 'skip-to':
            const skipToCmd = sync.require('./music/skip-to');
            skipToCmd.run(client, interaction);
            break;
        case 'stop':
            const stopCmd = sync.require('./music/stop');
            stopCmd.run(client, interaction);
            break;
        case 'volume':
            const volumeCmd = sync.require('./music/volume');
            volumeCmd.run(client, interaction);
            break;
        case 'skip':
            const skipCmd = sync.require('./music/skip');
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
    data: {
        name: "music",
        description: "stream music right from Discord from a variety of sources!",
        options: [{
            type: 1,
            name: "disconnect",
            description: "disconnect from the current music voice channel and clear the queue"
        }, {
            type: 1,
            name: "force-skip",
            description: "skip the currently playing song forcefully"
        }, {
            type: 1,
            name: "loop",
            description: "loop the entire queue"
        }, {
            type: 1,
            name: "lyrics",
            description: "get the lyrics for a song",
            options: [{
                type: 3,
                name: "song",
                description: "the name of song do you want me to search the lyric for",
                required: false
            }]
        }, {
            type: 1,
            name: "move",
            description: "move the current playing song around in the queue",
            options: [{
                type: 4,
                name: "from",
                description: "what is the index of the song that you want to move?",
                required: true
            }, {
                type: 4,
                name: "to",
                description: "where would you want to move it?",
                required: true
            }]
        }, {
            type: 1,
            name: "debug",
            description: "turn on debugging mode for the current queue"
        }, {
            type: 1,
            name: "now-playing",
            description: "display the status of the current playing song"
        }, {
            type: 1,
            name: "pause",
            description: "pause a playing song"
        }, {
            type: 1,
            name: "play",
            description: "play a song from a URL or from search query (lots of source supported!)",
            options: [{
                type: 3,
                name: "query",
                description: "what would you want to play?",
                required: true,
                autocomplete: true
            }]
        }, {
            type: 1,
            name: "playlist",
            description: "play an entire playlist or album from a URL or search query (lots of source supported)",
            options: [{
                type: 3,
                name: "query",
                description: "what would you want to play?",
                required: true,
                autocomplete: true
            }]
        }, {
            type: 1,
            name: "queue",
            description: "display the music queue that i'm playing"
        }, {
            type: 1,
            name: "remove",
            description: "remove one or many songs from the queue",
            options: [{
                type: 3,
                name: "index",
                description: "index(es) of the song that you want to remove in the queue (for example: 1 or 2, 3, 7)",
                required: true
            }]
        }, {
            type: 1,
            name: "repeat",
            description: "repeat the currently playing song"
        }, {
            type: 1,
            name: "resume",
            description: "resume a previously paused song"
        }, {
            type: 1,
            name: "search",
            description: "search a songs to play from (avaliable for YouTube and SoundCloud)",
            options: [{
                type: 3,
                name: "query",
                description: "what song would you want to search?",
                required: true,
                autocomplete: true
            }]
        }, {
            type: 1,
            name: "seek",
            description: "seek to a certain point of the song",
            options: [{
                type: 3,
                name: "timestamp",
                description: "where would you want to seek to? (for example 04:05 or 2m 6s)",
                required: true
            }]
        }, {
            type: 1,
            name: "shuffle",
            description: "shuffle the current queue"
        }, {
            type: 1,
            name: "skip-to",
            description: "skip to the selected song in the queue",
            options: [{
                type: 4,
                name: "index",
                description: "the index of the song that you want to skip to",
                required: true
            }]
        }, {
            type: 1,
            name: "skip",
            description: "skip the currently playing song"
        }, {
            type: 1,
            name: "stop",
            description: "stop the music and clear the queue"
        }, {
            type: 1,
            name: "volume",
            description: "change the volume of the current queue",
            options: [{
                type: 4,
                name: "amount",
                description: "the amount of volume that you want to set",
                required: false
            }]
        }]
    },
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    rawData: true
};