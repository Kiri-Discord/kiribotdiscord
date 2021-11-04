const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });

    const bands = new Array(6).fill(null).map((n, i) => { return { band: i, gain: 0.55 } });

    queue.player.equalizer(bands);
    const sayoriEmoji = client.customEmojis.get("sayori");
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `Applied **bassboost** to your current queue! This might take a few second... ${sayoriEmoji}`, footer: { text: `to reset all effect, use ${prefix}reset` } }] })
    if (queue.textChannel.id !== message.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} applied **bassboost** to the current queue ${sayoriEmoji}`, footer: { text: `to reset all effect, use ${prefix}reset` } }] });
};
exports.help = {
    name: "bassboost",
    description: "apply bassboost to your current queue",
    usage: ["bassboost"],
    example: ["bassboost"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};