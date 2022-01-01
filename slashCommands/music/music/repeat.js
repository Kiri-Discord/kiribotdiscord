const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    queue.repeat = !queue.repeat;
    if (queue.repeat && queue.loop) queue.loop = false;
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `repeat is turned ${queue.repeat ? "on" : "off"} for the current song 🔁` }] })
    if (queue.textChannel.id !== interaction.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} turn repeat ${queue.repeat ? "on" : "off"} for the current song 🔁` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = interaction.channel;
};