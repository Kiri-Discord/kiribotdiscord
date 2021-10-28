const move = require("array-move");
const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!queue.songs.length) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }], ephemeral: true });

    const from = interaction.options.getInteger('from');
    const to = interaction.options.getInteger('to');

    let song = queue.songs[from - 1];
    queue.songs = move(queue.songs, from - 1, to - 1);
    const index = to;
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `${interaction.user}, you moved **${song.info.title}** to position ${index} 🚚` }] });
    if (queue.textChannel.id !== interaction.channel.id) return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} moved **${song.info.title}** to position ${index} 🚚` }] });
};