const { canModifyQueue } = require("../../../util/musicutil");
exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (queue) {
        if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still being connected to a queue! you can wait until i finish to disconnect :slight_smile: if this is taking too long, use ${prefix}invite to visit my support server!` }], ephemeral: true });
    };
    if (!interaction.guild.me.voice.channel) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i am not connected to any voice channel!` }], ephemeral: true });
    if (queue && !canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    client.lavacordManager.leave(interaction.guild.id);

    const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
    return interaction.reply({ embeds: [{ color: "#bee7f7", description: `disconnected from the music voice channel! bye bye ${waveEmoji}` }] });
};