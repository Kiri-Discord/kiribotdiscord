const { canModifyQueue } = require("../../util/musicutil");
const { MessageEmbed } = require("discord.js");
exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    const embed = new MessageEmbed()
    .setColor("#bee7f7");
    queue.repeat = !queue.repeat;
    if (queue.repeat && queue.loop) {
        queue.loop = false;
        embed.setFooter({ text: 'loop has been turned off since loop and repeat can\'t be enabled together' })
    }
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) {
        embed.setDescription(`${message.author} turn repeat ${queue.repeat ? "on" : "off"} for the current song 🔁`)
        queue.textChannel.send({ embeds: [embed] });
    }
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    embed.setDescription(`repeat is turned ${queue.repeat ? "on" : "off"} for the current song 🔁`)
    return message.channel.send({ embeds: [embed] })
};
exports.help = {
    name: "repeat",
    description: "repeat the current song",
    usage: ["repeat"],
    example: ["repeat"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};