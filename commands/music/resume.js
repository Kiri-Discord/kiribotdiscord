const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });

    if (!queue.playing) {
        queue.playing = true;
        if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.resume(queue.player);
        else queue.player.resume();
        queue.pausedAt = undefined;
        if (queue.textChannel.id !== message.channel.id) message.channel.send('▶️ resuming...');

        queue.textChannel.send(({ embeds: [{ color: "#bee7f7", description: `${message.author.toString()} resumed the current song ▶️` }] }));
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