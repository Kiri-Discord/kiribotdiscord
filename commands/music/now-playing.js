const createBar = require("string-progressbar");
const { MessageEmbed } = require('discord.js');
const { SOUNDCLOUD_CLIENT_ID } = require("../../util/musicutil");
const ytdl = require("ytdl-core");
const scdl = require("soundcloud-downloader").default

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to show since i\'m not playing anything :grimacing:').catch(console.error);

    let songduration;
    const song = queue.songs[0];
    if (song.url.includes("youtube.com")) {
      const info = await ytdl.getInfo(song.url)
      songduration = info.videoDetails.lengthSeconds * 1000;
    } else if (song.url.includes("soundcloud.com")) {
      try {
        const info = await scdl.getInfo(song.url, SOUNDCLOUD_CLIENT_ID)
        songduration = info.duration;
      } catch (error) {
        const info = await scdl.getInfo(song.url, SOUNDCLOUD_CLIENT_ID)
        songduration = info.duration;
      }
    }
    const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
    const left = songduration - seek;

    const duration = songduration / 1000;

    let nowPlaying = new MessageEmbed()
    .setThumbnail(song.thumbnail)
    .setTitle(song.title)
    .setColor("RANDOM")
    .setAuthor('▶️ Now playing', client.user.displayAvatarURL())
    .setURL(song.url)
    .addField('Requested by', song.requestedby, true)
    .addField('Author', `[${song.author}](${song.authorurl})`, true)


    if (duration / 1000 > 0) {
        nowPlaying.addField("\u200b", `**${new Date(seek * 1000).toISOString().substr(11, 8)}**` + " " + "**[**" + `\`${createBar(duration == 0 ? seek : duration, seek, 6)[0]}\`` + "]" +  " " + `**${(duration == 0 ? " ◉ LIVE" : new Date(duration * 1000).toISOString().substr(11, 8))}**`, false);
        nowPlaying.setFooter(`Queue remaining time: ${new Date(left * 1000).toISOString().substr(11, 8)}`, client.user.displayAvatarURL({ dynamic: true }));
    }

    return message.channel.send(nowPlaying);
}
exports.help = {
  name: "now-playing",
  description: "Show the current music that i'm playing",
  usage: "now-playing",
  example: "now-playing"
}

exports.conf = {
  aliases: ["np", "nowplaying"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}