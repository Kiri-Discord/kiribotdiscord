const { reactIfAble } = require('../../util/util');
const { canModifyQueue } = require("../../util/musicutil");
exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (queue) {
        if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still being connected to a queue! you can wait until i finish to disconnect :slight_smile: if this is taking too long, use ${prefix}invite to visit my support server!` }] });
    };
    if (!message.guild.me.voice.channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i am not connected to any voice channel!` }] });
    if (queue && !canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    client.lavacordManager.leave(message.guild.id);
    return reactIfAble(message, client.user, '👋');
};

exports.help = {
    name: "disconnect",
    description: "disconnect from the current music voice channel and clear the queue",
    usage: ["disconnect"],
    example: ["disconnect"]
};

exports.conf = {
    aliases: ["dc"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};
