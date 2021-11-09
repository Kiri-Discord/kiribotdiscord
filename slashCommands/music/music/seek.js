const { canModifyQueue } = require("../../../util/musicutil");
const humanize = require('humanize-duration');
const timestring = require('timestring');
const { sec } = require('../../../util/util');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (queue.karaoke.isEnabled) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `seeking is not possible when scrolling-lyrics is on :pensive: you can turn it off by \`/scrolling-lyrics off\`` }], ephemeral: true });

    const song = queue.nowPlaying;
    if (!song.info.isSeekable) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `sorry, that song is unseekable :pensive:` }], ephemeral: true });
    const seek = queue.player.state.position;
    if (!seek) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `the song haven't started yet :slight_smile:` }] });
    if (song.requestedby.id !== interaction.user.id && !interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you don't have the permission to do it since you didn't request the song, or you don't have \`MANAGE_MESSAGES\` to seek it :(` }], ephemeral: true });

    const query = interaction.options.getString('timestamp');

    let time;
    try {
        time = timestring(query);
    } catch {
        time = sec(query);
    };

    const timeMs = time * 1000;
    if (timeMs > song.info.length - 5) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `that is wayy longer than the current playing song! can you check it again?` }], ephemeral: true });
    // const timestamp = queue.pausedAt ? queue.pausedAt - song.startedPlaying : Date.now() - song.startedPlaying;

    // if (timestamp >= timeMs) {
    //     song.startedPlaying = song.startedPlaying + (timestamp - timeMs);
    // } else if (timestamp <= timeMs) {
    //     song.startedPlaying = song.startedPlaying - (timeMs - timestamp);
    // };
    queue.player.seek(timeMs);
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `you seeked to **${humanize(timeMs)}** of **[${song.info.title}](${song.info.uri})**! 🚚` }] })
    if (queue.textChannel.id !== interaction.channel.id) return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `seeked to **${humanize(timeMs)}** of **[${song.info.title}](${song.info.uri})** - **${song.info.author}** [${song.requestedby}] 🚚` }] });
};