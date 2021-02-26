const { MessageEmbed } = require("discord.js");
const { play } = require("../../features/music/play");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const Guild = require('../../model/music');
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, MAX_PLAYLIST_SIZE, DEFAULT_VOLUME } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

exports.run = async (client, message, args) => {
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    const current = client.voicequeue.get(message.guild.id);
    if (current) return message.reply(current.prompt);
    const prefix = setting.prefix;
    const { channel } = message.member.voice;
    const serverQueue = client.queue.get(message.guild.id);

    if (!channel) return message.reply('you are not in a voice channel!');
    if (!channel.joinable) return message.reply("i can't join your voice channel :( check my perms pls");

    if (serverQueue && channel !== message.guild.me.voice.channel) {
        const voicechannel = serverQueue.channel
        return message.reply(`i have already been playing music to someone in your server! join ${voicechannel} to listen :smiley:`).catch(console.error);
    };
    if (!args.length) return message.reply(`you must to provide me a playlist to play or add to the queue! use \`${prefix}help playlist\` to learn more :wink:`).catch(console.error);

    const musicSettings = await Guild.findOne({
      guildId: message.guild.id
    });
    let volume;
    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(url);

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

    let playlist = null;
    let videos = [];
    let newSongs;
    let thumbnail;
    let playlisturl;

    if (urlValid) {
      try {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving playlist data...**`}})
        playlist = await youtube.getPlaylist(url, { part: "snippet" });
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE, { part: "snippet" })
        newSongs = videos
        .filter((video) => video.title != "Private video" && video.title != "Deleted video")
        .map((video) => {
          return (song = {
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            requestedby: message.author,
            thumbnail: video.thumbnails.high.url,
            authorurl: `https://www.youtube.com/channel/${video.raw.snippet.videoOwnerChannelId}`,
            author: video.raw.snippet.videoOwnerChannelTitle,
            duration: null
          })
        })
        thumbnail = videos[0].thumbnails.high.url;
        playlisturl = `https://www.youtube.com/playlist?list=${playlist.id}`;
      } catch (error) {
        console.error(error);
        return message.reply("i can't find the playlist from the URL you provided :(").catch(console.error);
      }
    } else if (scdl.isValidUrl(url)) {
      if (url.includes("/sets/")) {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving playlist data...**`}})
        playlist = await scdl.getSetInfo(url, SOUNDCLOUD_CLIENT_ID);
        videos = playlist.tracks.splice(0, MAX_PLAYLIST_SIZE - 1).map((track) => {
          return (song = {
              title: track.title,
              url: track.permalink_url,
              requestedby: message.author,
              thumbnail: track.artwork_url,
              authorurl: track.user.permalink_url,
              author: track.user.username,
              duration: null
          })
        });
        newSongs = videos;
        thumbnail = playlist.tracks[0].artwork_url;
        playlisturl = url;
      }
    } else {
      try {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving playlist data...**`}})
        const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
        playlist = results[0];
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE, { part: "snippet" })
        newSongs = videos
        .filter((video) => video.title != "Private video" && video.title != "Deleted video")
        .map((video) => {
          return (song = {
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            requestedby: message.author,
            thumbnail: video.thumbnails.high.url,
            authorurl: `https://www.youtube.com/channel/${video.raw.snippet.videoOwnerChannelId}`,
            author: video.raw.snippet.videoOwnerChannelTitle,
            duration: null
          })
        })
        thumbnail = videos[0].thumbnails.high.url;
        playlisturl = `https://www.youtube.com/playlist?list=${playlist.id}`;
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that playlist, sorry :(').catch(console.error);
      }
    }

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

    let playlistEmbed = new MessageEmbed()
    .setAuthor(`✔️ Requested by ${message.author.username}`,  message.author.displayAvatarURL({ dynamic: true }))
    .setTitle(playlist.title)
    .setColor('RANDOM')
    .setURL(playlisturl)
    .setThumbnail(thumbnail)

    if (newSongs.length > 6) {
      playlistEmbed.setDescription(newSongs.map((song, index) => `\`${index + 1}\` **[${song.title}](${song.url})**`).splice(0, 6).join("\n") + `\n\n*and ${newSongs.length - 6} more...*`);
    } else {
      playlistEmbed.setDescription(newSongs.map((song, index) => `\`${index + 1}\` **[${song.title}](${song.url})**`).join("\n"))
    }

    message.channel.send(`**${message.author.username}** successfully added playlist **${playlist.title}** to the queue ✅`, playlistEmbed);

    if (!serverQueue) {
      client.queue.set(message.guild.id, queueConstruct);

      try {
        queueConstruct.connection = await channel.join();
        await queueConstruct.connection.voice.setSelfDeaf(true);
        play(queueConstruct.songs[0], message, client);
      } catch (error) {
        console.error(error);
        client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send('there was an error when i tried to join your voice channel :pensive:').catch(console.error);
      }
    }
}

exports.help = {
  name: "playlist",
  description: "Play a playlist YouTube or Soundcloud",
  usage: ["play `<youtube playlist link>`", "play `<soundcloud playlist link>`"],
  example: ["play [this](https://www.youtube.com/playlist?list=PLi9drqWffJ9FWBo7ZVOiaVy0UQQEm4IbP)", "play [this](https://soundcloud.com/puppermusic/sets/good-vibes)"]
}

exports.conf = {
  aliases: ["pl"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK"]
}