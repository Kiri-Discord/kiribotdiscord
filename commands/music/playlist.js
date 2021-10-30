const { MessageEmbed } = require("discord.js");
const Queue = require("../../features/music/play");
const { fetchInfo } = require('../../util/util');
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const Guild = require('../../model/music');
const { YOUTUBE_API_KEY, DEFAULT_VOLUME } = require("../../util/musicutil");
const validUrl = require('valid-url');
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const { verify, verifyLanguage } = require('../../util/util');
const { getTracks } = require('spotify-url-info');

exports.run = async(client, message, args, prefix, cmd, internal, bulkAdd) => {
        const { channel } = message.member.voice;
        const serverQueue = client.queue.get(message.guild.id);
        if (!channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: '⚠️ you are not in a voice channel!' }] });

        if (!channel.joinable || !channel.speakable) return message.reply({ embeds: [{ color: "#bee7f7", description: "i can't join or talk in the voice channel where you are in. can you check my permission?" }] });

        if (serverQueue && channel !== message.guild.me.voice.channel) {
            const voicechannel = serverQueue.channel;
            return message.reply({ embeds: [{ color: "#bee7f7", description: `i have already been playing music in your server! join ${voicechannel} to listen :smiley:` }] });
        };
        if (!args.length) return message.channel.send({ embeds: [{ color: "RED", description: `you must to provide me something to play! use \`${prefix}help playlist\` to learn more :wink:` }] });
        const search = args.join(" ");

        const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
        const spotifyRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist|episode|show)(?::|\/)((?:[0-9a-zA-Z]){22})/;
        const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;

        let url = args[0];


        const urlValid = pattern.test(url);
        const musicSettings = await Guild.findOne({
            guildId: message.guild.id
        });
        const queueConstruct = new Queue(message.guild.id, client, message.channel, channel);

        if (musicSettings && !internal) {
            queueConstruct.karaoke.isEnabled = false;
            queueConstruct.volume = musicSettings.volume;
            const channel = message.guild.channels.cache.get(musicSettings.KaraokeChannelID);
            if (musicSettings.KaraokeChannelID && !serverQueue && channel) {
                const msg1 = await message.channel.send({ embeds: [{ description: `scrolling lyric mode is now set to \`ON\` in the setting and all lyrics will be sent to ${channel}\ndo you want me to enable this to your queue, too? \`y/n\`\n\nyou only have to do this **ONCE** only for this queue :wink:`, footer: { text: `type 'no' or leave this for 10 second to bypass` } }] });
                const verification = await verify(message.channel, message.author, { time: 10000 });
                if (verification) {
                    const msg2 = await message.channel.send({ embeds: [{ description: `nice! okay so what language do you want me to sing in for the upcoming queue?\nresponse in a valid language: for example \`English\` or \`Japanese\` to continue :arrow_right:`, footer: { text: 'this confirmation will timeout in 10 second. type \'cancel\' to cancel this confirmation.' } }] });
                    const response = await verifyLanguage(message.channel, message.author, { time: 10000 });
                    if (response.isVerify) {
                        msg1.delete();
                        msg2.delete();
                        queueConstruct.karaoke.languageCode = response.choice;
                        queueConstruct.karaoke.channel = channel;
                        queueConstruct.karaoke.isEnabled = true;
                    } else {
                        queueConstruct.karaoke.isEnabled = false;
                        msg1.delete();
                        msg2.delete();
                        message.channel.send('you didn\'t answer anything! i will just play the song now...');
                    };
                } else {
                    msg1.delete();
                    message.channel.send('you didn\'t answer anything! i will just play the song now...');
                };
            };
        } else {
            queueConstruct.karaoke.isEnabled = false;
            queueConstruct.volume = DEFAULT_VOLUME;
        };
        if (internal) {
            queueConstruct.karaoke = internal;
        };
        let newSongs;
        let playlistURL;
        if (bulkAdd) {
            newSongs = bulkAdd;
        } else if (urlValid) {
            try {
                newSongs = await fetchInfo(client, url, null);
                if (!newSongs || !newSongs.length) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                playlistURL = url;
                newSongs.forEach(song => {
                    song.type = 'yt';
                    song.requestedby = message.author;
                });
            } catch (error) {
                return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
            };
        } else if (scdl.isValidUrl(url) || mobileScRegex.test(url)) {
            try {
                newSongs = await fetchInfo(client, url, null, 'yt');
                if (!newSongs || !newSongs.length) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found (SoundCloud tends to break things as i'm working on my end. try again later!)` }] });
                playlistURL = url;
                newSongs.forEach(song => {
                    song.type = 'sc';
                    song.requestedby = message.author;
                });
            } catch (error) {
                return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
            };
        } else if (url.match(spotifyRegex)) {
            const fields = url.match(spotifyRegex);
            const logo = client.customEmojis.get('spotify') ? client.customEmojis.get('spotify').toString() : '⚠️';
            if (fields[1] === 'episode' || fields[1] === 'show') {
                return message.channel.send({ embeds: [{ color: "#bee7f7", description: `${logo} sorry, i don't support podcast link from Spotify :pensive:` }] });
            };
            try {
                newSongs = [];
                if (fields[1] === 'playlist' || fields[1] === 'album') {
                    const playlist = await getTracks(url);
                    if (!playlist || !playlist.length) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                    for (const data of playlist) {
                        const song = {
                            info: {
                                uri: data.external_urls.spotify,
                                title: data.name,
                                author: data.artists.map(x => x.name).join(", "),
                                length: data.duration_ms
                            },
                            type: 'sp',
                            requestedby: message.author
                        };
                        newSongs.push(song);
                    };
                    if (!newSongs.length) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                    playlistURL = url;
                    newSongs.forEach(song => {
                        song.requestedby = message.author;
                    });
                };
            } catch (error) {
                return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
            };
        } else if (validUrl.isWebUri(url)) {
            try {
                newSongs = await fetchInfo(client, url, null);
                if (!newSongs || !newSongs.length) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                playlistURL = url;
                newSongs.forEach(song => {
                    song.type = 'other';
                    song.requestedby = message.author;
                });
            } catch (error) {
                return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
            };
        } else {
            try {
                const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
                if (!results[0]) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                const playlist = results[0];
                newSongs = await fetchInfo(client, `https://www.youtube.com/playlist?list=${playlist.id}`);
                if (!newSongs || !newSongs.length) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                playlistURL = `https://www.youtube.com/playlist?list=${playlist.id}`;
                newSongs.forEach(song => {
                    song.type = 'yt';
                    song.requestedby = message.author;
                });
            } catch (error) {
                logger.log('error', error);
                return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
            };
        };
        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);
        let playlistEmbed = new MessageEmbed()
            .setDescription(`✅ Added **${newSongs.length}** ${newSongs.length > 1 ? `[tracks](${playlistURL || newSongs[0].info.uri})` : `[track](${playlistURL || newSongs[0].info.uri})`} to the queue [${message.author}]`);
        message.channel.send({embeds: [playlistEmbed]});
    if (!serverQueue) {
        client.queue.set(message.guild.id, queueConstruct);
        try {
            queueConstruct.play(queueConstruct.songs[0]);
        } catch (error) {
            logger.log('error', error);
            client.queue.delete(message.guild.id);
            return message.channel.send({ embeds: [{ color: "RED", description: `:x: there was an error when i tried to join your voice channel!` }] }).catch(err => logger.log('error', err));
        };
    };
};

exports.help = {
    name: "playlist",
    description: "play an entire playlist or album (lots of source supported)",
    usage: ["playlist `<link>`", "playlist `<search query>`"],
    example: ["playlist [this](https://www.youtube.com/playlist?list=PLi9drqWffJ9FWBo7ZVOiaVy0UQQEm4IbP)", "playlist [this](https://soundcloud.com/puppermusic/sets/good-vibes)"]
};

exports.conf = {
    aliases: ["pl"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};