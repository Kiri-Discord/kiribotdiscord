const move = require("array-move");
const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }] });
    if (!args[0]) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you must to tell me what song you want to move! use \`${prefix}help move\` to learn more :wink:` }] });
    if (!args[1]) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `where do you want to move that song to? use \`${prefix}help move\` to learn more :wink:` }] });
    if (isNaN(args[0]) || args[0] < 1) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `that is an invalid queue position number :pensive:` }] });
    if (isNaN(args[1]) || args[1] < 1) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `that is an invalid queue position number :pensive:` }] });
    let song = queue.songs[args[0] - 1];
    queue.songs = move(queue.songs, args[0] - 1, args[1] - 1);
    const index = args[1];
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} moved **${song.info.title}** to position ${index} 🚚` }] });
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `you moved **${song.info.title}** to position ${index} 🚚` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
}

exports.help = {
    name: "move",
    description: "move the current playing song around in the queue",
    usage: ["move `<position of track> <position to move>`"],
    example: ["move `4 7`"]
};

exports.conf = {
    aliases: ["mv"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};