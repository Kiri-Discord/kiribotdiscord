const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    queue.debug = !queue.debug;
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `music debugging is turned ${queue.debug ? "on" : "off"} for the current queue! feel free to check \`${prefix}invite\` to get more info about support servers if i'm stuck somewhere ^^` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
};
exports.help = {
    name: "music-debug",
    description: "turn on debugging mode for the current queue",
    usage: ["music-debug"],
    example: ["music-debug"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};