const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    queue.repeat = !queue.repeat;
    if (queue.repeat && queue.loop) queue.loop = false;
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} turn repeat ${queue.repeat ? "on" : "off"} for the current song 🔁` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `repeat is turned ${queue.repeat ? "on" : "off"} for the current song 🔁` }] })
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