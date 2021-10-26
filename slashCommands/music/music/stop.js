const { canModifyQueue } = require("../../../util/musicutil");
exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    queue.nowPlaying = undefined;
    queue.songs = [];
    if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
    queue.stop('selfStop');
    return interaction.reply({ embeds: [{ color: "#bee7f7", description: `stopped the current queue 🛑` }] });
};