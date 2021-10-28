const { canModifyQueue } = require("../../../util/musicutil");
const { shuffle } = require('../../../util/util');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    const songs = queue.songs;
    const shuffled = shuffle(songs);
    queue.songs = shuffled;
    client.queue.set(interaction.guild.id, queue);
    if (queue.textChannel.id !== interaction.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} has shuffled the queue 🔀` }] });
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `you has shuffled the queue 🔀` }] });
};