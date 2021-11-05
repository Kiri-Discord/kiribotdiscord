const { canModifyQueue } = require("../../util/musicutil");
const eq = require('../../assets/equalizer');

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });

    const body = eq.reset;
    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body,
    });
    queue.player.volume(100);

    message.channel.send({ embeds: [{ color: "#bee7f7", description: `resetted all filter in this queue :slight_smile:` }] })
    if (queue.textChannel.id !== message.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} resetted all filter in this queue` }] });
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