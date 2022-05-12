const { splitBar } = require("string-progressbar");
const { MessageEmbed } = require('discord.js');
const { formatDuration } = require('../../../util/musicutil');

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
    if (!song) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: the song haven't played yet :pensive:` }], ephemeral: true });
    const seek = queue.player.state.position || 0;

    const duration = song.info.isStream ? null : song.info.length;
    const cursor = client.customEmojis.get('truck') ? client.customEmojis.get('truck') : '🔵';
    const fixedSeek = Math.floor(seek / 1000);

    const bar = splitBar(duration == 0 || !duration ? fixedSeek : duration / 1000, fixedSeek, 16, '▬', cursor)[0];
    const status = queue.playing ? '`▶`' : '`⏸`';
    let nowPlaying = new MessageEmbed()
        .setDescription(`**[${song.info.title}](${song.info.uri})** - **${song.info.author}** [${song.requestedby}] ${song.autoQueued ? '(auto-enqueued)': ''}\n${status} ${bar} \`${formatDuration(seek)}/${!duration ? "LIVE" : formatDuration(duration)}\``)
    return interaction.reply({ embeds: [nowPlaying] });
};