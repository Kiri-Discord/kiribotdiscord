const { canModifyQueue } = require("../../../util/musicutil");

const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!queue.songs.length) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }], ephemeral: true });

    const arguments = interaction.options.getString('index');
    let removed = [];
    const songs = arguments.split(",").map((str) => str.trim());

    if (pattern.test(arguments)) {
        if (songs.some(x => x > queue.songs.length)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `some of those are not a number or a correct position in the queue :pensive:` }], ephemeral: true });
        queue.songs = queue.songs.filter((item, index) => {
            if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
            else return true;
        });
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ you removed **${removed.map((song) => song.info.title).join("\n")}** from the queue` }] });
        if (queue.textChannel.id !== interaction.channel.id) return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} removed **${removed.map((song) => song.info.title).join("\n")}** from the queue ❌` }] })
    } else if (!isNaN(arguments) && songs.length <= 1 && arguments > 1 && arguments <= queue.songs.length) {
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ you removed **${queue.songs.splice(arguments - 1, 1)[0].info.title}** from the queue ❌` }] });
        if (queue.textChannel.id !== interaction.channel.id) return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} removed **${queue.songs.splice(arguments - 1, 1)[0].info.title}** from the queue ❌` }] });
    } else {
        return interaction.reply({ embeds: [{ color: "#bee7f7", description: `your indexes are invalid or doesn't follow the format! (/music remove \`1\` or /music remove \`2, 5, 6\`)` }], ephemeral: true });
    };
};