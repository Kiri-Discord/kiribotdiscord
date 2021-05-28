const ytdl = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader").default;
const { MessageEmbed } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const humanizeDuration = require("humanize-duration");
const Guild = require('../../model/music');
const { sing } = require("./karaoke");

module.exports = {
  async play(song, message, client, prefix) {
    let duration;
    const { SOUNDCLOUD_CLIENT_ID } = require("../../util/musicutil");

    const queue = client.queue.get(message.guild.id);
    if (queue.karaoke.timeout.length) {
      queue.karaoke.timeout.forEach(x => {
          clearTimeout(x);
      });
      queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
  }
    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
        queue.channel.leave();
        queue.textChannel.send({embed: {color: "f3f3f3", description: `**i'm leaving the voice channel...byebye** 👋`}});
      }, STAY_TIME * 1000);
      queue.textChannel.send({embed: {color: "f3f3f3", description: `**the music queue has ended** :pensive:`}}).catch(console.error);
      if (queue.karaoke.timeout.length) {
        queue.karaoke.timeout.forEach(x => {
            clearTimeout(x);
        });
        queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
    }
      await Guild.findOneAndUpdate({
        guildId: message.guild.id
      }, {
        guildId: message.guild.id,
        volume: queue.volume
      }, {
        upsert: true,
        new: true
      })
      return client.queue.delete(message.guild.id);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
        const info = await ytdl.getInfo(song.url);
        duration = info.videoDetails.lengthSeconds * 1000;
        song.duration = duration;
        queue.songs.splice(0, 1, song);
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
          const info = await scdl.getInfo(song.url, SOUNDCLOUD_CLIENT_ID)
          duration = info.duration;
          song.duration = duration;
          queue.songs.splice(0, 1, song);
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
          streamType = "unknown";
          const info = await scdl.getInfo(song.url, SOUNDCLOUD_CLIENT_ID)
          duration = info.duration;
          song.duration = duration;
          queue.songs.splice(0, 1, song);
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message, client);
      }
      console.error(error);
      return message.channel.send('there was an error while playing the music queue :pensive: skipping to next song in the queue...\n*tips: the music should be less than 3 hours and MUST not be a live stream*');
    }

    queue.connection.on("disconnect", () => {
      if (queue.karaoke.timeout.length) {
        queue.karaoke.timeout.forEach(x => {
            clearTimeout(x);
        });
        queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
      }
      client.queue.delete(message.guild.id);
    });
    try {
      const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (queue.loop) {
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message, client);
        } else {
          queue.songs.shift();
          module.exports.play(queue.songs[0], message, client);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message, client);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);
    } catch (error) {
      queue.connection.disconnect();
      if (queue) return queue.textChannel.send({embed: {color: "f3f3f3", description: `**there was an error while playing the music** :pensive:`}});
    }
    try {
      if (queue.karaoke.isEnabled) {
        sing(song, queue.karaoke.channel, queue.karaoke.languageCode, queue, prefix)
      };
      const embed = new MessageEmbed()
      .setURL(song.url)
      .setTitle(song.title)
      .addField('Duration', humanizeDuration(duration), true)
      .addField('Author', `[${song.author}](${song.authorurl})`, true)
      .setAuthor('Now playing', song.requestedby.displayAvatarURL())
      .addField('Requested by', song.requestedby, true)
      .setColor(queue.color)
      await queue.textChannel.send(embed);
    } catch (error) {
      console.error(error);
    }
  }
};