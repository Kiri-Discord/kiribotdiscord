const { canModifyQueue } = require("../../util/musicutil");
const { reactIfAble } = require('../../util/util');
exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embed: { color: "f3f3f3", description: `:x: there isn't any ongoing music queue` } });
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` } });
    client.lavacordManager.leave(queue.textChannel.guild.id);
    return reactIfAble(message, client.user, '👋')
};


exports.help = {
    name: "disconnect",
    description: "disconnect from the current music voice channel and clear the queue",
    usage: "disconnect",
    example: "disconnect"
};

exports.conf = {
    aliases: ["dc"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};