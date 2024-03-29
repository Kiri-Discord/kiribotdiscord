const { canModifyQueue } = require("../../util/musicutil");
const { reactIfAble } = require("../../util/util");
exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    queue.nowPlaying = undefined;
    queue.songs = [];
    queue.stop('selfStop');
    return reactIfAble(message, client.user, '👌')
};

exports.help = {
    name: "stop",
    description: "stop the music and clear the queue :pensive:",
    usage: ["stop"],
    example: ["stop"]
}

exports.conf = {
    aliases: ["end", 'clear'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}