const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });

    const volume = interaction.options.getInteger('amount');

    if (!volume) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `the current volume is ${queue.volume}! you can change it with \`/music volume <amount>\` 🔊` }], ephemeral: true });

    if (volume > 100 || volume < 0) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `the amount of the volume must not lower than zero, and must not higher than 100% ❌` }], ephemeral: true });

    queue.volume = volume;
    queue.player.volume(volume);
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `volume set to ${volume} 🔊` }] });
    if (queue.textChannel.id !== interaction.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} set the volume to ${volume} 🔊` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = interaction.channel;
};
