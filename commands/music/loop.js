const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    queue.loop = !queue.loop;
    if (queue.repeat && queue.loop) queue.repeat = false;
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} turn loop ${queue.loop ? "on" : "off"} for the whole queue 🔁` }] });
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `loop is turned ${queue.loop ? "on" : "off"} for the whole queue 🔁` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
};
exports.help = {
    name: "loop",
    description: "loop the whole queue",
    usage: ["loop"],
    example: ["loop"]
};

exports.conf = {
    aliases: ["lp"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};