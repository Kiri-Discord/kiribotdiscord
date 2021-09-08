const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embed: { color: "f3f3f3", description: `:x: there isn't any ongoing music queue` } });
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` } });
    if (!args[0]) return message.reply({ embed: { color: "f3f3f3", description: `the current volume is ${queue.volume} 🔊` } });
    if (isNaN(args[0])) return message.reply({ embed: { color: "f3f3f3", description: `the amount of volume must be a number ❌` } });
    if (Number(args[0]) > 100 || Number(args[0]) < 0) return message.reply({ embed: { color: "f3f3f3", description: `the amount of the volume must not lower than zero, and must not higher than 100% ❌` } });
    queue.volume = args[0];
    queue.player.volume(args[0]);
    if (queue.textChannel.id !== message.channel.id) message.channel.send({ embed: { color: "f3f3f3", description: `volume set to ${args[0]} 🔊` } });
    return queue.textChannel.send({ embed: { color: "f3f3f3", description: `${message.author} set the volume to ${args[0]} 🔊` } });
}


exports.help = {
    name: "volume",
    description: "Change the volume of the current playing song",
    usage: "volume `<0 - 100>`",
    example: ["volume `40`", "volume 30"]
}

exports.conf = {
    aliases: ["vol"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}