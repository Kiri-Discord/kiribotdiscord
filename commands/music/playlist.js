const { MessageEmbed } = require("discord.js");
const { play } = require("../../features/music/play");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const ms = require("ms");

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
    }

    if (!args.length) return message.reply(`wrong usage :( use ${prefix}playlist <youtube playlist URL | soundcloud playlist URL> to play some music!`).catch(console.error);

    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(url);
    

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME || 100,
      playing: true
    };

    let playlist = null;
    let videos = [];

    if (urlValid) {
      try {
        playlist = await youtube.getPlaylist(url, { part: "snippet" });
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        console.error(error);
        return message.reply("i can't find the playlist from the URL you provided :(").catch(console.error);
      }
    } else if (scdl.isValidUrl(url)) {
      if (url.includes("/sets/")) {
        message.channel.send("i'm fetching the playlist info...wait a moment please :)");
        playlist = await scdl.getSetInfo(url, SOUNDCLOUD_CLIENT_ID);
        videos = playlist.tracks.map((track) => ({
          title: track.title,
          url: track.permalink_url,
          duration: ms(track.duration, {long: true}),
          requestedby: message.author,
          thumbnail: track.artwork_url,
          authorurl: track.user.permalink_url,
          author: track.user.full_name,
        }));
        newSongs = videos;
      }
    } else {
      try {
        const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
        playlist = results[0];
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        console.error(error);
        return message.reply('there was an error when i tried to get the info of that playlist, sorry :(').catch(console.error);
      }
    }


    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

    let playlistEmbed = new MessageEmbed()
    .setTitle(`${playlist.title}`)
    .setDescription(newSongs.map((song, index) => `${index + 1}. ${song.title}`))
    .setURL(playlist.url)
    .setColor("#F8AA2A")
    .setTimestamp();

    if (playlistEmbed.description.length >= 2048)
      playlistEmbed.description =
        playlistEmbed.description.substr(0, 2007) + "...";

    message.channel.send(`now playing ${playlist.title}!`, playlistEmbed);

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
  example: ["play `[this](https://www.youtube.com/playlist?list=PLi9drqWffJ9FWBo7ZVOiaVy0UQQEm4IbP)`", "play `[this](https://soundcloud.com/puppermusic/sets/good-vibes)`"]
}

exports.conf = {
  aliases: ["pl"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK"]
}