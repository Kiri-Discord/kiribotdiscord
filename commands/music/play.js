const { play } = require("../../features/music/play");
const { MessageEmbed } = require('discord.js')
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default
const https = require("https");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, DEFAULT_VOLUME } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const humanizeDuration = require("humanize-duration");
const Guild = require('../../model/music')

exports.run = async (client, message, args) => {

    const setting = await client.dbguilds.findOne({
      guildID: message.guild.id
    });
    const prefix = setting.prefix;
    const current = client.voicequeue.get(message.guild.id);
    if (current) return message.reply(current.prompt);
    const { channel } = message.member.voice;
    const serverQueue = client.queue.get(message.guild.id);
    if (!channel) return message.reply('you are not in a voice channel!');
    if (!channel.joinable) return message.reply("i can't join your voice channel :( check my perms please")
    if (serverQueue && channel !== message.guild.me.voice.channel) {
        const voicechannel = serverQueue.channel
        return message.reply(`i have already been playing music to someone in your server! join ${voicechannel} to listen :smiley:`).catch(console.error);
    }
    const musicSettings = await Guild.findOne({
      guildId: message.guild.id
    });

    if (!args.length) return message.reply(`you must to provide me something to play! use \`${prefix}help play\` to learn more :wink:`);
    let duration;
    let volume;
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

    if (mobileScRegex.test(url)) {
      try {
        https.get(url, function (res) {
          if (res.statusCode == "302") {
            return message.client.commands.get("play").run(client, message, [res.headers.location]);
          } else {
            return message.reply("no content could be found at that url :pensive:").catch(console.error);
          }
        });
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the song from that link :pensive:').catch(console.error);
      }
      return message.channel.send("following url redirection...").catch(console.error);
    }
    if (musicSettings) {
      volume = musicSettings.volume;
    } else {
      volume = DEFAULT_VOLUME;
    }

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: volume,
      playing: true
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving song data...**`}})
        songInfo = await ytdl.getInfo(url);
        duration = songInfo.videoDetails.lengthSeconds * 1000
        song = {
          authorurl: songInfo.videoDetails.ownerProfileUrl,
          author: songInfo.videoDetails.ownerChannelName,
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          requestedby: message.author,
          thumbnail: songInfo.videoDetails.thumbnails[0].url,
          duration: null
        };
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that song, sorry :(').catch(console.error);
      }
    } else if (scRegex.test(url)) {
      try {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving song data...**`}})
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        duration = trackInfo.duration;
        song = {
          authorurl: trackInfo.user.permalink_url,
          author: trackInfo.user.username,
          title: trackInfo.title,
          url: trackInfo.permalink_url,
          requestedby: message.author,
          thumbnail: trackInfo.artwork_url,
          duration: null
        };

      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that song, sorry :(').catch(console.error);
      }
    } else {
      try {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **searching** \`${search}\` **on YouTube...**`}})
        const results = await youtube.searchVideos(search, 1, { part: "snippet" });
        songInfo = await ytdl.getInfo(results[0].url);
        duration = songInfo.videoDetails.lengthSeconds * 1000
        song = {
          authorurl: songInfo.videoDetails.ownerProfileUrl,
          author: songInfo.videoDetails.ownerChannelName,
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          requestedby: message.author,
          thumbnail: songInfo.videoDetails.thumbnails[0].url,
          duration: null
        };
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that song, sorry :(').catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      const embed = new MessageEmbed()
      .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setURL(song.url)
      .setTitle(song.title)
      .setThumbnail(song.thumbnail)
      .setColor('RANDOM')
      .addField('Author', `[${song.author}](${song.authorurl})`, true)
      .addField('Requested by', song.requestedby, true)
      .addField('Duration', humanizeDuration(duration), true)
      return serverQueue.textChannel
        .send(`**${song.requestedby.username}** added a song to the queue ✅`, embed)
        .catch(console.error);
    }

    queueConstruct.songs.push(song);
    client.queue.set(message.guild.id, queueConstruct);

    try {
        queueConstruct.connection = await channel.join();
        message.channel.send({embed: {color: "f3f3f3", description: `**i have joined your voice channel :microphone2: \`#${channel.name}\` and bound to :page_facing_up: ${message.channel}!**`}})
        await queueConstruct.connection.voice.setSelfDeaf(true);
        play(queueConstruct.songs[0], message, client);
    } catch (error) {
        console.error(error);
        client.queue.delete(message.guild.id);
        await channel.leave();
        await client.voicequeue.delete(message.guild.id);
        return message.channel.send('there was an error when i tried to join your voice channel :pensive:').catch(console.error);
    }
}

exports.help = {
  name: "play",
  description: "Plays audio from YouTube or Soundcloud",
  usage: ["play `<song name>`", "play `<youtube link>`", "play `<soundcloud link>`"],
  example: ["play [this](https://www.youtube.com/watch?v=dQw4w9WgXcQ)", "play [this](https://soundcloud.com/thepopposse/never-gonna-give-you-up)"]
}

exports.conf = {
  aliases: ["p"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK"]
}