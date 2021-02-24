const ytdl = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader").default;
const { MessageEmbed } = require('discord.js')
const { canModifyQueue, STAY_TIME, PRUNING } = require("../../util/musicutil");
const humanizeDuration = require("humanize-duration");

module.exports = {
  async play(song, message, client) {
    let duration;
    const { SOUNDCLOUD_CLIENT_ID } = require("../../util/musicutil");

    const queue = client.queue.get(message.guild.id);

    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
        queue.channel.leave();
        queue.textChannel.send({embed: {color: "f3f3f3", description: `i'm leaving the voice channel...byebye 👋`}});
      }, STAY_TIME * 1000);
      queue.textChannel.send({embed: {color: "f3f3f3", description: `the music queue has ended 🛑`}}).catch(console.error);
      return client.queue.delete(message.guild.id);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
        const info = await ytdl.getInfo(song.url)
        duration = info.videoDetails.lengthSeconds * 1000;
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
          const info = await scdl.getInfo(song.url, SOUNDCLOUD_CLIENT_ID)
          duration = info.duration;
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
          const info = await scdl.getInfo(song.url, SOUNDCLOUD_CLIENT_ID)
          duration = info.duration;
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
      .addField('Duration', humanizeDuration(duration), true)
      .addField('Author', `[${song.author}](${song.authorurl})`, true)
      .setAuthor('Now playing 🎵', client.user.displayAvatarURL({ dynamic: true }))
      .setThumbnail(song.thumbnail)
      .addField('Requested by', song.requestedby, true)
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
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);;
          queue.connection.dispatcher.end();
          queue.textChannel.send({embed: {color: "f3f3f3", description: `⏩ ${user} has skipped the current song.`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} has paused the music ⏸`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} resumed the music! ▶`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} muted the music! 🔇`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} muted the music! 🔇`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 0) return;
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} decreased the volume, the volume is now ${queue.volume}% 🔉`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 100) return;
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} increased the volume, the volume is now ${queue.volume}% 🔊`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);;
          queue.loop = !queue.loop;
          queue.textChannel.send({embed: {color: "f3f3f3", description: `loop is now ${queue.loop ? "on" : "off"} for the current song 🔁`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return queue.textChannel.send({embed: {color: "f3f3f3", description: `${user}, you must to join a voice channel first!`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);;
          queue.songs = [];
          queue.textChannel.send({embed: {color: "f3f3f3", description: `${user} stopped the music! 🛑`}}).then(m => m.delete({ timeout: 4000 })).catch(console.error);
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