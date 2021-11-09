const { splitBar } = require("string-progressbar");
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({
        embeds: [{
            description: 'there is nothing to display since i\'m not playing anything :grimacing:'
        }],
        ephemeral: true
    });

    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    const song = queue.nowPlaying;
    // const seek = song.startedPlaying ? (queue.pausedAt ? queue.pausedAt - song.startedPlaying : Date.now() - song.startedPlaying) : null;
    const seek = queue.player.state.position || 0;

    const duration = song.info.isStream ? null : song.info.length;
    const cursor = client.customEmojis.get('truck') ? client.customEmojis.get('truck') : '🔵';
    const fixedSeek = Math.floor(seek / 1000);

    const bar = splitBar(duration == 0 || !duration ? fixedSeek : duration / 1000, fixedSeek, 16, '▬', cursor)[0];
    const status = queue.playing ? '`▶`' : '`⏸`';
    let nowPlaying = new MessageEmbed()
        .setDescription(`**[${song.info.title}](${song.info.uri})** - **${song.info.author}** [${song.requestedby}]\n${status} ${bar} \`${moment.duration(seek).format('H[h] m[m] s[s]')}/${!duration ? "LIVE" : moment.duration(duration).format('H[h] m[m] s[s]')}\``)
    return interaction.reply({ embeds: [nowPlaying] });
};