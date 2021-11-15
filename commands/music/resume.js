const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!queue.playing) {
        queue.playing = true;
        queue.player.resume();
        if (queue.textChannel.id !== message.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author.toString()} resumed the current song ▶️` }] });
        if (queue.textChannel.deleted) queue.textChannel = message.channel;
        message.channel.send({ embeds: [{ color: "#bee7f7", description: `you resumed the current song ▶️` }] });

        clearTimeout(queue.dcTimeout);
        queue.dcTimeout = undefined;
    } else {
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i am already playing!` }] })
    };
};
exports.help = {
    name: "resume",
    description: "resume the current playing song",
    usage: ["resume"],
    example: ["resume"]
}

exports.conf = {
    aliases: ["re"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}