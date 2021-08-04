const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embed: { color: "f3f3f3", description: `:x: there isn't any ongoing music queue` } });
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` } });

    if (!queue.playing) {
        queue.playing = true;
        queue.player.resume();
        queue.pausedAt = undefined;
        if (queue.textChannel.id !== message.channel.id) message.channel.send('▶️ resuming...')
        queue.textChannel.send(({ embed: { color: "f3f3f3", description: `${message.author} resumed the current song ▶️${queue.karaoke.isEnabled ? '\n*note: interruption such as pausing or disconnecting will force me to stop displaying auto lyrics*' : ''}` } }));
        clearTimeout(queue.dcTimeout);
        queue.dcTimeout = undefined;
    } else {
        return message.channel.send({ embed: { color: "f3f3f3", description: `:x: i am already paused!` } })
    }

}
exports.help = {
    name: "resume",
    description: "resume the current playing song",
    usage: "resume",
    example: "resume"
}

exports.conf = {
    aliases: ["re"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}