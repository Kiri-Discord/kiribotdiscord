const { play } = require("../../features/music/play");
const { MessageEmbed } = require('discord.js')
const ytdl = require("ytdl-core");
const scdl = require("soundcloud-downloader").default
const https = require("https");
const { SOUNDCLOUD_CLIENT_ID, DEFAULT_VOLUME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const { verify, verifyLanguage, embedURL } = require('../../util/util');

exports.run = async(client, message, args, prefix, cmd, internal) => {
    const current = client.voicequeue.get(message.guild.id);
    if (current) return message.inlineReply(current.prompt);
    const { channel } = message.member.voice;
    const serverQueue = client.queue.get(message.guild.id);
    if (!channel) return message.channel.send({ embed: { color: "f3f3f3", description: `⚠️ you are not in a voice channel!` } });
    if (!channel.joinable) return message.inlineReply("i can't join your voice channel :( can you check my perms?")
    if (serverQueue && channel !== message.guild.me.voice.channel) {
        const voicechannel = serverQueue.channel
        return message.inlineReply(`i have already been playing music in your server! join ${voicechannel} to listen :smiley:`).catch(console.error);
    };

    const musicSettings = await Guild.findOne({
        guildId: message.guild.id
    });

    if (!args.length) return message.inlineReply(`you must to provide me something to play! use \`${prefix}help play\` to learn more :wink:`);
    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
        return client.commands.get("playlist").run(client, message, args);
    } else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
        return client.commands.get("playlist").run(client, message, args);
    }
    let queueConstruct = {
        textChannel: message.channel,
        channel,
        connection: null,
        songs: [],
        loop: false,
        playing: true,
        volume: null,
        karaoke: {
            timeout: [],
            channel: null,
            isEnabled: null,
            languageCode: null
        }
    };
    if (musicSettings && !internal) {
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
    if (internal) {
        queueConstruct.karaoke = internal;
    }
    let song = null;

    if (mobileScRegex.test(url)) {
        try {
            https.get(url, function(res) {
                if (res.statusCode == "302") {
                    return client.commands.get("play").run(client, message, [res.headers.location]);
                } else {
                    return message.inlineReply("no content could be found at that url :pensive:").catch(console.error);
                }
            });
        } catch (error) {
            return message.inlineReply('there was an error when i tried to get the song from that link :pensive:').catch(console.error);
        }
        return message.channel.send("following url redirection...").catch(console.error);
    }
    if (urlValid) {
        try {
            message.channel.send({ embed: { color: "f3f3f3", description: `**retrieving song data...** :mag_right:` } })
            const songInfo = await ytdl.getInfo(url);
            song = {
                authorurl: songInfo.videoDetails.ownerProfileUrl,
                author: songInfo.videoDetails.ownerChannelName,
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                requestedby: message.author,
                duration: songInfo.videoDetails.lengthSeconds * 1000,
                type: 'yt'
            };
        } catch (error) {
            return message.channel.send("i can't find any song with that URL :pensive:\n*if this problem persist, probably YouTube is ratelimiting me from playing the audio. try again later :(*");
        }
    } else if (scRegex.test(url)) {
        try {
            message.channel.send({ embed: { color: "f3f3f3", description: `**retrieving song data...** :mag_right:` } })
            const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
            duration = trackInfo.duration;
            song = {
                authorurl: trackInfo.user.permalink_url,
                author: trackInfo.user.username,
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                requestedby: message.author,
                duration: trackInfo.duration
            };
        } catch (error) {
            return message.inlineReply("i can't find any song with that URL :pensive:").catch(console.error);
        }
    } else {
        return client.commands
            .get("search")
            .run(client, message, [search], prefix, cmd, queueConstruct.karaoke);
    }

    if (serverQueue) {
        serverQueue.songs.push(song);
        const embed = new MessageEmbed()
            .setDescription(`✅ Added **${embedURL(song.title, song.url)}** by **${embedURL(song.author, song.authorurl)}** to the queue [${song.requestedby}]`)
        return serverQueue.textChannel
            .send(embed)
            .catch(console.error);
    };
    queueConstruct.songs.push(song);
    client.queue.set(message.guild.id, queueConstruct);

    try {
        queueConstruct.connection = await channel.join();
        if (!queueConstruct.connection) {
            client.queue.delete(message.guild.id);
            return message.channel.send('there was an error when i tried to join your voice channel :pensive:').catch(console.error);
        }
        message.channel.send({ embed: { description: `**i have joined your voice channel :microphone2: \`#${channel.name}\` and bound to :page_facing_up: ${message.channel}!**` } })
        play(queueConstruct.songs[0], message, client, prefix);
    } catch (error) {
        console.error(error);
        client.queue.delete(message.guild.id);
        if (queueConstruct.connection) await channel.leave();
        await client.voicequeue.delete(message.guild.id);
        return message.channel.send('there was an error when i tried to join your voice channel :pensive:').catch(console.error);
    }
}

exports.help = {
    name: "play",
    description: "Plays song from YouTube or Soundcloud",
    usage: ["play `<song name>`", "play `<youtube link>`", "play `<soundcloud link>`"],
    example: ["play [this](https://www.youtube.com/watch?v=dQw4w9WgXcQ)", "play [this](https://soundcloud.com/thepopposse/never-gonna-give-you-up)"]
}

exports.conf = {
    aliases: ["p"],
    cooldown: 4,
    guildOnly: true,
    clientPerms: ["CONNECT", "SPEAK"],
    channelPerms: ["EMBED_LINKS"]
};