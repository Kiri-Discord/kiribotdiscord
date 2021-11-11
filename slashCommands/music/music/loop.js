const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    queue.loop = !queue.loop;
    if (queue.repeat && queue.loop) queue.repeat = false;
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `loop is turned ${queue.loop ? "on" : "off"} for the whole queue 🔁` }], ephemeral: true })
    if (queue.textChannel.id !== interaction.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} turn loop ${queue.loop ? "on" : "off"} for the whole queue 🔁` }] });
    if (queue.textChannel.deleted) queue.textChannel = interaction.channel;
};