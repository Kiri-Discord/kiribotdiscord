const { play, fetchInfo } = require("../../features/music/play");
const { MessageEmbed } = require('discord.js')
const scdl = require("soundcloud-downloader").default;
const { DEFAULT_VOLUME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const { verify, verifyLanguage, embedURL } = require('../../util/util');

exports.run = async(client, message, args, prefix, cmd, internal) => {
    const { channel } = message.member.voice;
    const serverQueue = client.queue.get(message.guild.id);
    if (!channel) return message.channel.send({ embed: { color: "f3f3f3", description: `⚠️ you are not in a voice channel!` } });
    if (!channel.joinable) return message.inlineReply({ embed: { color: "f3f3f3", description: "i can't join the voice channel where you are in. can you check my permission?" } })
    if (serverQueue && channel !== message.guild.me.voice.channel) {
        const voicechannel = serverQueue.channel
        return message.inlineReply(`i have already been playing music in your server! join ${voicechannel} to listen :smiley:`).catch(console.error);
    };

    const musicSettings = await Guild.findOne({
        guildId: message.guild.id
    });

    if (!args.length) return message.inlineReply({ embed: { color: "RED", description: `you must to provide me something to play! use \`${prefix}help play\` to learn more :wink:` } });
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
        playingMessage: null,
        textChannel: message.channel,
        channel,
        player: null,
        songs: [],
        loop: false,
        playing: true,
        nowPlaying: null,
        volume: null,
        karaoke: {
            timeout: [],
            channel: null,
            isEnabled: null,
            languageCode: null,
            instance: null,
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

    if (urlValid) {
        try {
            [song] = await fetchInfo(client, url, false);
            if (!song) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } });
            song.type = 'yt';
            song.requestedby = message.author;
        } catch (error) {
            console.log(error)
            return message.channel.send({ embed: { color: "RED", description: `:x: no match were found. try again later :pensive:` } });
        }
    } else if (scRegex.test(url) || mobileScRegex.test(url)) {
        try {
            [song] = await fetchInfo(client, url, false, 'yt');
            if (!song) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found (SoundCloud tends to break things as we are working on our end. try again later!)` } });
            song.type = 'sc';
            song.requestedby = message.author;
        } catch (error) {
            return message.channel.send({ embed: { color: "RED", description: `:x: no match were found. try again later :pensive:` } });
        }
    } else {
        return client.commands
            .get("search")
            .run(client, message, [search], prefix, cmd, queueConstruct.karaoke);
    }

    if (serverQueue) {
        serverQueue.songs.push(song);
        const embed = new MessageEmbed()
            .setDescription(`✅ Added **${embedURL(song.info.title, song.info.uri)}** by **${song.info.author}** to the queue [${song.requestedby}]`)
        return serverQueue.textChannel
            .send(embed)
            .catch(console.error);
    };
    queueConstruct.songs.push(song);
    client.queue.set(message.guild.id, queueConstruct);

    try {
        play(queueConstruct.songs[0], message, client, prefix);
    } catch (error) {
        console.error(error);
        client.queue.delete(message.guild.id);
        return message.channel.send({ embed: { color: "RED", description: `:x: there was an error when i tried to join your voice channel` } }).catch(console.error);
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