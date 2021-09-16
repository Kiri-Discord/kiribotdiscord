const { canModifyQueue } = require("../../util/musicutil");
exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` }] });
    queue.playing = true;
    await queue.player.stop();
    if (queue.textChannel.id !== message.channel.id) message.channel.send({ embeds: [{ color: "f3f3f3", description: `${message.author}, you skipped to the next track in the queue ⏭` }] })
    return queue.textChannel.send({ embeds: [{ color: "f3f3f3", description: `${message.author} skipped to the next track in the queue ⏭` }] });
};
exports.help = {
    name: "force-skip",
    description: "skip the currently playing song forcefully",
    usage: "force-skip",
    example: "force-skip"
};

exports.conf = {
    aliases: ["fs", "forceskip"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_MESSAGES"],
    channelPerms: ["EMBED_LINKS"]
};