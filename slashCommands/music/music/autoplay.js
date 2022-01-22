const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.karaoke.isEnabled) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `autoplay is not possible when scrolling lyrics is on :pensive: you can turn it off by \`${prefix}scrolling-lyrics off\`` }], ephemeral: true });
    queue.autoPlay = !queue.autoPlay;
    const autoEmoji = client.customEmojis.get('autoplay') ? client.customEmojis.get('autoplay').toString() : '🔁'
    return interaction.reply({ embeds: [{ color: "#bee7f7", description: `${autoEmoji} autoplay has been turned ${queue.autoPlay ? "on" : "off"} for the current queue! i will start enqueuing new song when the queue is empty!` }] })
}