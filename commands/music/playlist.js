const { MessageEmbed } = require("discord.js");
const { play, fetchInfo } = require("../../features/music/play");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const Guild = require('../../model/music');
const { YOUTUBE_API_KEY, DEFAULT_VOLUME } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const { verify, verifyLanguage } = require('../../util/util');

exports.run = async(client, message, args, prefix) => {
        if (!args.length) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `you must to provide me a playlist to play or add to the queue! use \`${prefix}help playlist\` to learn more :wink:` }] });
        const { channel } = message.member.voice;
        const serverQueue = client.queue.get(message.guild.id);
        if (!channel) return message.inlineReply('you are not in a voice channel!');
        if (!channel.joinable) return message.inlineReply("i can't join your voice channel :( check my perms pls");

        if (serverQueue && channel !== message.guild.me.voice.channel) {
            const voicechannel = serverQueue.channel
            return message.inlineReply({ embeds: [{ color: "f3f3f3", description: `:x: i have already been playing music on another channel in your server! join ${voicechannel.toString()} to listen!` }] });
        };

        const musicSettings = await Guild.findOne({
            guildId: message.guild.id
        });
        const search = args.join(" ");
        const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
        const url = args[0];
        const urlValid = pattern.test(url);
        let queueConstruct = {
            textChannel: message.channel,
            channel,
            player: null,
            songs: [],
            loop: false,
            playing: true,
            volume: null,
            nowPlaying: null,
            karaoke: {
                timeout: [],
                channel: null,
                isEnabled: null,
                languageCode: null
            }
        };
        if (musicSettings) {
            queueConstruct.karaoke.isEnabled = false;
            queueConstruct.volume = musicSettings.volume;
            const channel = message.guild.channels.cache.get(musicSettings.KaraokeChannelID);
            if (musicSettings.KaraokeChannelID && !serverQueue && channel) {
                message.channel.send({ embed: { color: "f3f3f3", description: `scrolling lyric mode is now set to \`ON\` in the setting and all lyrics will be sent to ${channel}\ndo you want me to enable this to your queue, too? \`y/n\`\n\ntype \`no\` or leave this for 10 second to bypass this. you only have to do this **ONCE** only for this queue :wink:` }, footer: { text: `don\'t want to see this again? turn this off by using ${prefix}scrolling-lyrics -off` } });
                const verification = await verify(message.channel, message.author, { time: 10000 });
                if (verification) {
                    await message.channel.send({ embed: { color: "f3f3f3", description: `nice! okay so what language do you want me to sing in for the upcoming queue?\nresponse in a valid language: for example \`English\` or \`Japanese\` to continue :arrow_right:`, footer: { text: 'this confirmation will timeout in 10 second. type \'cancel\' to cancel this confirmation.' } } });
                    const response = await verifyLanguage(message.channel, message.author, { time: 10000 });
                    if (response.isVerify) {
                        queueConstruct.karaoke.languageCode = response.choice;
                        queueConstruct.karaoke.channel = channel;
                        queueConstruct.karaoke.isEnabled = true;
                    } else {
                        queueConstruct.karaoke.isEnabled = false;
                        message.channel.send('you didn\'t answer anything! i will just play the song now...')
                    }
                }
            }
        } else {
            queueConstruct.karaoke.isEnabled = false;
            queueConstruct.volume = DEFAULT_VOLUME;
        };

        let newSongs;
        let playlistURL;

        if (urlValid) {
            try {

                newSongs = await fetchInfo(client, url, false);
                if (!newSongs) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
                playlistURL = url;
                newSongs.forEach(song => {
                    song.type = 'yt';
                    song.requestedby = message.author;
                });
            } catch (error) {
                return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
            }
        } else if (scdl.isValidUrl(url)) {
            try {
                if (url.includes("/sets/")) {
                    newSongs = await fetchInfo(client, url, false, 'sc');
                    if (!newSongs) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
                    playlistURL = url;
                    newSongs.forEach(song => {
                        song.type = 'sc';
                        song.requestedby = message.author;
                    });
                };
            } catch (error) {
                return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
            }
        } else {
            try {
                const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
                if (!results[0]) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
                const playlist = results[0];
                newSongs = await fetchInfo(client, `https://www.youtube.com/playlist?list=${playlist.id}`);
                if (!newSongs) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
                playlistURL = `https://www.youtube.com/playlist?list=${playlist.id}`;
                newSongs.forEach(song => {
                    song.type = 'yt';
                    song.requestedby = message.author;
                });
            } catch (error) {
                console.error(error);
                return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
            }
        }

        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);
        let playlistEmbed = new MessageEmbed()
            .setDescription(`✅ Added **${newSongs.length}** ${newSongs.length > 1 ? `[tracks](${playlistURL})` : `[track](${playlistURL})`} to the queue [${message.author}]`)
    message.channel.send(playlistEmbed);

    if (!serverQueue) {
        client.queue.set(message.guild.id, queueConstruct);

        try {
            play(queueConstruct.songs[0], message, client, prefix);
        } catch (error) {
            console.error(error);
            client.queue.delete(message.guild.id);
            return message.channel.send({ embed: { color: "RED", description: `:x: there was an error when i tried to join your voice channel` } }).catch(console.error);
        }
    }
}

exports.help = {
    name: "playlist",
    description: "play a YouTube playlist or Soundcloud playlist",
    usage: ["playlist `<youtube playlist link>`", "playlist `<soundcloud playlist link>`"],
    example: ["playlist [this](https://www.youtube.com/playlist?list=PLi9drqWffJ9FWBo7ZVOiaVy0UQQEm4IbP)", "playlist [this](https://soundcloud.com/puppermusic/sets/good-vibes)"]
}

exports.conf = {
    aliases: ["pl"],
    cooldown: 3,
    guildOnly: true,
    clientPerms: ["CONNECT", "SPEAK"],
    channelPerms: ["EMBED_LINKS"]
}