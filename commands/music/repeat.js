const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` }] });
    queue.repeat = !queue.repeat;
    if (queue.textChannel.id !== message.channel.id) message.channel.send({ embeds: [{ color: "f3f3f3", description: `repeat is turned ${queue.repeat ? "on" : "off"} for the current song 🔁` }] })
    queue.textChannel.send({ embeds: [{ color: "f3f3f3", description: `${message.author} turn repeat ${queue.repeat ? "on" : "off"} for the current song 🔁` }] }).catch(err => logger.log('error', err));
};
exports.help = {
    name: "repeat",
    description: "repeat the current song",
    usage: ["repeat"],
    example: ["repeat"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};