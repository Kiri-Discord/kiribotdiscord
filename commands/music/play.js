const { play } = require("../../features/music/play");
const { MessageEmbed } = require('discord.js')
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default
const https = require("https");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, DEFAULT_VOLUME } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const humanizeDuration = require("humanize-duration");

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
    if (!channel.joinable) return message.reply("i can't join your voice channel :( check my perms pls")
    if (serverQueue && channel !== message.guild.me.voice.channel) {
        const voicechannel = serverQueue.channel
        return message.reply(`i have already been playing music to someone in your server! join ${voicechannel} to listen :smiley:`).catch(console.error);
    }

    if (!args.length) return message.reply(`wrong usage :( use ${prefix}play <youtube URL | video name | soundcloud URL> to play some music!`).catch(console.error);
    let duration;
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

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME || 100,
      playing: true
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        duration = songInfo.videoDetails.lengthSeconds * 1000
        song = {
          authorurl: songInfo.videoDetails.ownerProfileUrl,
          author: songInfo.videoDetails.ownerChannelName,
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          requestedby: message.author,
          thumbnail: songInfo.videoDetails.thumbnails[0].url,
        };
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that song, sorry :(').catch(console.error);
      }
    } else if (scRegex.test(url)) {
      try {
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        duration = trackInfo.duration;
        song = {
          authorurl: trackInfo.user.permalink_url,
          author: trackInfo.user.full_name,
          title: trackInfo.title,
          url: trackInfo.permalink_url,
          requestedby: message.author,
          thumbnail: trackInfo.artwork_url
        };

      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that song, sorry :(').catch(console.error);
      }
    } else {
      try {
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
        };
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that song, sorry :(').catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      const embed = new MessageEmbed()
      .setURL(song.url)
      .setTitle(song.title)
      .setTimestamp()
      .setThumbnail(song.thumbnail)
      .setColor('#ffe6cc')
      .setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
      .addField('Author', `[${song.author}](${song.authorurl})`, true)
      .addField('Requested by', song.requestedby, true)
      .addField('Duration', humanizeDuration(duration))
      .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
      return serverQueue.textChannel
        .send(`${song.requestedby.username} added a song to the queue ✅`, embed)
        .catch(console.error);
    }

    queueConstruct.songs.push(song);
    client.queue.set(message.guild.id, queueConstruct);

    try {
        queueConstruct.connection = await channel.join();
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
  example: ["play `https://www.youtube.com/watch?v=dQw4w9WgXcQ`", "play `https://soundcloud.com/thepopposse/never-gonna-give-you-up`"]
}

exports.conf = {
  aliases: ["p"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK"]
}