const { canModifyQueue } = require("../../../util/musicutil");
const eq = require('../../../assets/equalizer');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });

    const body = eq.reset;
    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body,
    });
    queue.player.volume(100);

    interaction.reply({ embeds: [{ color: "#bee7f7", description: `resetted all filter in this queue :slight_smile:` }] })
    if (queue.textChannel.id !== interaction.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} resetted all filter in this queue` }] });
};


exports.help = {
    name: "reset",
    description: "reset all applied music filter",
    usage: ["reset"],
    example: ["reset"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};