const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!queue.playing) {
        queue.playing = true;
        if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.resume(queue.player);
        else queue.player.resume();
        queue.pausedAt = undefined;
        if (queue.textChannel.id !== interaction.channel.id) interaction.reply('▶️ resuming...');

        queue.textChannel.send(({ embeds: [{ color: "#bee7f7", description: `${interaction.user.toString()} resumed the current song ▶️` }] }));
        clearTimeout(queue.dcTimeout);
        queue.dcTimeout = undefined;
    } else {
        return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i am already playing!` }], ephemeral: true })
    };
};