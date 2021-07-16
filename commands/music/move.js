const move = require("array-move");
const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to move since i\'m not playing anything :grimacing:');
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `${user}, you must to join ${queue.channel} where i am playing music first!` } });
    if (!args[0]) return message.channel.send({ embed: { color: "f3f3f3", description: `you must to tell me what song you want to move! use \`${prefix}help move\` to learn more :wink:` } });
    if (!args[1]) return message.channel.send({ embed: { color: "f3f3f3", description: `where do you want to move that song to? use \`${prefix}help move\` to learn more :wink:` } });
    if (isNaN(args[0]) || args[0] <= 1) return message.channel.send({ embed: { color: "f3f3f3", description: `that is an invalid queue position number :pensive:` } });
    if (isNaN(args[1]) || args[1] <= 1) return message.channel.send({ embed: { color: "f3f3f3", description: `that is an invalid queue position number :pensive:` } });
    let song = queue.songs[args[0] - 1];
    queue.songs = move(queue.songs, args[0] - 1, args[1] == 1 ? 1 : args[1] - 1);
    const index = args[1] == 1 ? 1 : args[1];
    if (queue.textChannel.id !== message.channel.id) message.channel.send({ embed: { color: "f3f3f3", description: `${message.author}, you moved **${song.title}** to position ${index} 🚚` } });
    return queue.textChannel.send({ embed: { color: "f3f3f3", description: `${message.author} moved **${song.title}** to position ${index} 🚚` } });
}

exports.help = {
    name: "move",
    description: "Move the current playing song around in the queue",
    usage: "move `<position of track> <position in queue>`",
    example: "move `4 7`"
}

exports.conf = {
    aliases: ["mv"],
    cooldown: 3,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
}