const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!args[0]) return message.reply({ embeds: [{ color: "#bee7f7", description: `the current volume is ${queue.volume}! you can change it with \`${prefix}volume <amount>\` 🔊` }] });
    if (isNaN(args[0])) return message.reply({ embeds: [{ color: "#bee7f7", description: `the amount of volume must be a number ❌` }] });
    if (Number(args[0]) > 100 || Number(args[0]) < 0) return message.reply({ embeds: [{ color: "#bee7f7", description: `the amount of the volume must not lower than zero, and must not higher than 100% ❌` }] });
    queue.volume = args[0];
    queue.player.volume(args[0]);
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} set the volume to ${args[0]} 🔊` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `volume set to ${args[0]} 🔊` }] });
}


exports.help = {
    name: "volume",
    description: "change the volume of the current queue",
    usage: ["volume `<0 - 100>`"],
    example: ["volume `40`", "volume 30"]
}

exports.conf = {
    aliases: ["vol"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}