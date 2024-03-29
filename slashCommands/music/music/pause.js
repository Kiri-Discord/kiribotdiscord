const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: 'there is nothing to pause since i\'m not playing anything :grimacing:' }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });

    if (queue.playing) {
        queue.pause();
        if (queue.textChannel.id !== interaction.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} paused the current song ⏸️` }] });
        if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = interaction.channel;
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `you paused the current song ⏸️` }] });
    } else {
        return interaction.reply({ content: 'the music is already paused :thinking:', ephemeral: true });
    };
};