const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    queue.debug = !queue.debug;
    return interaction.reply({ embeds: [{ color: "#bee7f7", description: `music debugging is turned ${queue.debug ? "on" : "off"} for the current queue! feel free to check \`/invite\` to get more info about support servers if i'm stuck somewhere ^^` }] })
};