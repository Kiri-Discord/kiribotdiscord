const { canModifyQueue } = require("../../util/musicutil");
const { reactIfAble } = require("../../util/util");
exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embed: { color: "f3f3f3", description: `:x: there isn't any ongoing music queue` } });
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` } });
    queue.songs = [];
    await queue.player.stop();
    return reactIfAble(message, client.user, '👌')
}

exports.help = {
    name: "stop",
    description: "stop the music and clear the queue :pensive:",
    usage: "stop",
    example: "stop"
}

exports.conf = {
    aliases: ["end", 'clear'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}