const ytdl = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader").default;
const { MessageEmbed } = require('discord.js')
const { canModifyQueue, STAY_TIME, PRUNING } = require("../../util/musicutil");
const ms = require("ms");

module.exports = {
  async play(song, message, client) {
    const { SOUNDCLOUD_CLIENT_ID } = require("../../util/musicutil");

    const queue = client.queue.get(message.guild.id);

    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
        queue.channel.leave();
        queue.textChannel.send("i'm leaving the voice channel...byebye 👋");
      }, STAY_TIME * 1000);
      queue.textChannel.send('🛑 the music queue has ended.').catch(console.error);
      return client.queue.delete(message.guild.id);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message, client);
      }

      console.error(error);
      return message.channel.send('there was an error while playing the music queue :pensive:');
    }

    queue.connection.on("disconnect", () => client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

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

    try {
      const embed = new MessageEmbed()
      .setURL(song.url)
      .setTitle(song.title)
      .setTimestamp()
      .setThumbnail(song.thumbnail)
      .setColor('#ffe6cc')
      .addField('Duration', ms(song.duration * 100, {long: true}), true)
      .addField('Author', `[${song.author}](${song.authorurl})`, true)
      .setAuthor('🎵 Now playing!', client.user.displayAvatarURL({ dynamic: true }))
      .setThumbnail(song.thumbnail)
      .addField('Requested by', message.author.tag, true)
      var playingMessage = await queue.textChannel.send(embed);
      await playingMessage.react("⏭");
      await playingMessage.react("⏯");
      await playingMessage.react("🔇");
      await playingMessage.react("🔉");
      await playingMessage.react("🔊");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          queue.connection.dispatcher.end();
          queue.textChannel.send(`⏩ ${user} has skipped the current song.`).catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            queue.textChannel.send(`⏸ ${user} has paused the music`).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            queue.textChannel.send(`▶ ${user} resumed the music again!`).catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            queue.textChannel.send(`🔇 ${user} muted the music!`).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            queue.textChannel.send(`🔇 ${user} muted the music!`).catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 0) return;
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send(`🔉 ${user} decreased the volume, the volume is now ${queue.volume}%`).catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 100) return;
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send(`🔊 ${user} increased the volume, the volume is now ${queue.volume}%`).catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          queue.loop = !queue.loop;
          queue.textChannel.send(`loop is now ${queue.loop ? "on" : "off"}`).catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return `${user}, you must to join a voice channel first!`;
          queue.songs = [];
          queue.textChannel.send(`🛑 ${user} stopped the music!`).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    }); 

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
      }
      client.voicequeue.delete(message.guild.id);
    });
  }
};