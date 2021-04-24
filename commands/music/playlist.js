const { MessageEmbed } = require("discord.js");
const { play } = require("../../features/music/play");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const Guild = require('../../model/music');
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, MAX_PLAYLIST_SIZE, DEFAULT_VOLUME } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const { verify, verifyLanguage } = require('../../util/util');

exports.run = async (client, message, args, prefix) => {
    const current = client.voicequeue.get(message.guild.id);
    if (current) return message.inlineReply(current.prompt);
    const { channel } = message.member.voice;
    const serverQueue = client.queue.get(message.guild.id);
    if (!channel) return message.inlineReply('you are not in a voice channel!');
    if (!channel.joinable) return message.inlineReply("i can't join your voice channel :( check my perms pls");

    if (serverQueue && channel !== message.guild.me.voice.channel) {
        const voicechannel = serverQueue.channel
        return message.inlineReply(`i have already been playing music to someone in your server! join \`#${voicechannel.name}\` to listen :smiley:`).catch(console.error);
    };
    if (!args.length) return message.inlineReply(`you must to provide me a playlist to play or add to the queue! use \`${prefix}help playlist\` to learn more :wink:`).catch(console.error);

    const musicSettings = await Guild.findOne({
      guildId: message.guild.id
    });
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
      volume: null,
      color: message.guild.me.displayHexColor,
      karaoke: Object,
      playing: true
    };
    if (musicSettings) {
      queueConstruct.karaoke.isEnabled = false;
      queueConstruct.volume = musicSettings.volume;
      const channel = message.guild.channels.cache.get(musicSettings.KaraokeChannelID);
      if (musicSettings.KaraokeChannelID && !serverQueue && channel) {
        message.channel.send({embed: {color: "f3f3f3", description: `scrolling lyric mode is now set to \`ON\` in the setting and all lyrics will be sent to ${channel}\ndo you want me to enable this to your queue, too? \`y/n\`\n\ntype \`no\` or leave this for 10 second to bypass this. you only have to do this **ONCE** only for this queue :wink:`}, footer: { text: `don\'t want to see this again? turn this off by using ${prefix}lyrics -off` }});
        const verification = await verify(message.channel, message.author, { time: 10000 });
        if (verification) {
          await message.inlineReply({embed: {color: "f3f3f3", description: `nice! okay so what language do you want me to sing in for the upcoming queue?\nresponse in a valid language: for example \`English\` or \`Japanese\` to continue :arrow_right:`, footer: { text: 'this confirmation will timeout in 10 second. type \'cancel\' to cancel this confirmation.' }}});
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
    }
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
            authorurl: `https://www.youtube.com/channel/${video.raw.snippet.videoOwnerChannelId}`,
            author: video.raw.snippet.videoOwnerChannelTitle,
            duration: null,
            type: 'yt'
          })
        })
        playlisturl = `https://www.youtube.com/playlist?list=${playlist.id}`;
      } catch (error) {
        return message.inlineReply("i can't find the playlist from the URL you provided :(").catch(console.error);
      }
    } else if (scdl.isValidUrl(url)) {
      try {
        if (url.includes("/sets/")) {
          message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving playlist data...**`}})
          playlist = await scdl.getSetInfo(url, SOUNDCLOUD_CLIENT_ID);
          videos = playlist.tracks.splice(0, MAX_PLAYLIST_SIZE - 1).map((track) => {
            return (song = {
                title: track.title,
                url: track.permalink_url,
                requestedby: message.author,
                authorurl: track.user.permalink_url,
                author: track.user.username,
                duration: null,
                type: 'sc',
            })
          });
          newSongs = videos;
          playlisturl = url;
        }
      } catch (error) {
        return message.inlineReply("i can't find any playlist with that URL :pensive:").catch(console.error);
      }
    } else {
      try {
        message.channel.send({embed: {color: "f3f3f3", description: `:mag_right: **retrieving playlist data...**`}})
        const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
        if (!results[0]) return message.inlineReply("i can't find any playlist with that search query :pensive:").catch(console.error);
        playlist = results[0];
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE, { part: "snippet" })
        newSongs = videos
        .filter((video) => video.title != "Private video" && video.title != "Deleted video")
        .map((video) => {
          return (song = {
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            requestedby: message.author,
            authorurl: `https://www.youtube.com/channel/${video.raw.snippet.videoOwnerChannelId}`,
            author: video.raw.snippet.videoOwnerChannelTitle,
            duration: null,
            type: 'yt'
          })
        })
        playlisturl = `https://www.youtube.com/playlist?list=${playlist.id}`;
      } catch (error) {
        console.error(error);
        return message.inlineReply('there was an error when i tried to get the info of that playlist, sorry :(').catch(console.error);
      }
    }

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

    let playlistEmbed = new MessageEmbed()
    .setAuthor(`✔️ Upcoming`,  message.author.displayAvatarURL({ dynamic: true }))
    .setTitle(playlist.title)
    .setURL(playlisturl)
    .setColor(message.guild.me.displayHexColor)

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
        if (!queueConstruct.connection) {
          client.queue.delete(message.guild.id);
          return message.channel.send('there was an error when i tried to join your voice channel :pensive:').catch(console.error);
        } 
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
  clientPerms: ["CONNECT", "SPEAK"],
  channelPerms: ["EMBED_LINKS"]
}
