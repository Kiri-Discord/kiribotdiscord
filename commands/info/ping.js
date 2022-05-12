const { MessageEmbed } = require("discord.js");
const { formatDuration } = require('../../util/musicutil');

exports.run = async(client, message, args) => {
    const pingMessage = await message.channel.send(`almost there...`);
    const ping = pingMessage.createdTimestamp - message.createdTimestamp;

    const embed = new MessageEmbed()
    .setDescription(`
    some additional statuses:
    > • Discord WebSocket ping: \`${client.ws.ping}\`ms
    > • cluster uptime: \`${formatDuration(client.uptime)}\`
    > • this cluster has \`${client.guilds.cache.size}\` guilds
    > • currently on shard \`${message.guild.shardId + 1}\` of cluster \`${client.cluster.id + 1}\` out of \`${client.cluster.count}\` clusters
    `)
    return pingMessage.edit({ content: `pong! took me \`${ping}\`ms!`, embeds: [embed] });
};

exports.help = {
    name: "ping",
    description: "ping me and check if i'm actually alive or not",
    usage: [`ping`],
    example: [`ping`]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
};