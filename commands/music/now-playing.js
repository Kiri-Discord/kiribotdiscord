const createBar = require("string-progressbar");
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to show since i\'m not playing anything :grimacing:').catch(console.error);

    const song = queue.songs[0];
    const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
    const left = song.duration - seek;

    const duration = song.duration / 1000;

    let nowPlaying = new MessageEmbed()
    .setThumbnail(song.thumbnail)
    .setTitle(`Now playing: ${song.title}`)
    .setColor("#ffe6cc")
    .setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
    .setURL(song.url)
    .addField('Requested by', song.requestedby, true)
    .addField('Author', `[${song.author}](${song.authorurl})`, true)

    if (duration / 1000 > 0) {
        nowPlaying.addField("\u200b", new Date(seek * 1000).toISOString().substr(11, 8) + " " + "[" + createBar(duration == 0 ? seek : duration, seek, 20)[0] + "]" +  " " + (duration == 0 ? " ◉ LIVE" : new Date(duration * 1000).toISOString().substr(11, 8)), false);
        nowPlaying.setFooter(`Remaining time: ${new Date(left * 1000).toISOString().substr(11, 8)}`, client.user.displayAvatarURL({ dynamic: true }));
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
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK"]
}