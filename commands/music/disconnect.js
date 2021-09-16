const { reactIfAble } = require('../../util/util');
exports.run = async(client, message, args) => {
    if (!message.guild.me.voice.channel) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `:x: i am not connected to any voice channel!` }] });
    client.lavacordManager.leave(message.guild.id);
    return reactIfAble(message, client.user, '👋');
};

exports.help = {
    name: "disconnect",
    description: "disconnect from the current music voice channel and clear the queue",
    usage: "disconnect",
    example: "disconnect"
};

exports.conf = {
    aliases: ["dc"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};