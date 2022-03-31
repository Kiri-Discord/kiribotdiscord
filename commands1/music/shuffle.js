const { canModifyQueue } = require("../../util/musicutil");
const { shuffle } = require('../../util/util');

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    const songs = queue.songs;
    const shuffled = shuffle(songs);
    queue.songs = shuffled;
    client.queue.set(message.guild.id, queue);

    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} has shuffled the queue 🔀` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `${message.author}, you has shuffled the queue 🔀` }] });
};

exports.help = {
    name: "shuffle",
    description: "shuffle the music queue",
    usage: ["shuffle"],
    example: ["shuffle"]
};

exports.conf = {
    aliases: ["sh"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};