const createBar = require("string-progressbar");
const moment = require('moment');
require('moment-duration-format');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to show since i\'m not playing anything :grimacing:').catch(console.error);
    const song = queue.songs[0];
    const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
    const left = song.duration / 1000 - seek;
    const duration = song.duration / 1000;
    const cursor = client.customEmojis.get('truck') ? client.customEmojis.get('truck') : '🔵';

    let nowPlaying = new MessageEmbed()
    .setColor(queue.color)
    .setTitle(`Now playing in ${message.guild.name}`)
    .setDescription(`
    [${song.title}](${song.url}) - [${song.author}](${song.authorurl}) [${song.requestedby}]

    ${createBar(duration == 0 ? seek : duration, seek, 15, '▬', cursor)[0]} ${moment.duration(seek * 1000).format('H [h] m [m] s [s]')}/${(duration == 0 ? "LIVE" : moment.duration(duration * 1000).format('H [h] m [m] s [s]'))}
    `)
    if (duration / 1000 > 0) {
        nowPlaying.setFooter(`Remaining time: ${new Date(left * 1000).toISOString().substr(11, 8)}`);
    };
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
  
  channelPerms: ["EMBED_LINKS"]
}
