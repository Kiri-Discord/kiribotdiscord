const { splitBar } = require("string-progressbar");
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({
        embeds: [{
            description: 'there is nothing to display since i\'m not playing anything :grimacing:'
        }]
    });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    const song = queue.nowPlaying;

    const seek = song.startedPlaying ? (queue.pausedAt ? (queue.pausedAt - song.startedPlaying) / 1000 : (Date.now() - song.startedPlaying) / 1000) : null;
    if (!seek) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `the song haven't started yet :slight_smile:` }] });
    const duration = song.info.isStream ? null : song.info.length / 1000;
    const cursor = client.customEmojis.get('truck') ? client.customEmojis.get('truck') : '🔵';
    let nowPlaying = new MessageEmbed()
        .setDescription(`
    **[${song.info.title}](${song.info.uri})** - **${song.info.author}** [${song.requestedby}]
    ${splitBar(duration == 0 ? seek : duration, seek, 16, '▬', cursor)[0]} ${moment.duration(seek * 1000).format('H[h] m[m] s[s]')}/${!duration ? "LIVE" : moment.duration(duration * 1000).format('H[h] m[m] s[s]')}
    `)
    return message.channel.send({ embeds: [nowPlaying] });
};
exports.help = {
    name: "now-playing",
    description: "show the current playing music in the queue",
    usage: ["now-playing"],
    example: ["now-playing"]
};

exports.conf = {
    aliases: ["np", "nowplaying"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};