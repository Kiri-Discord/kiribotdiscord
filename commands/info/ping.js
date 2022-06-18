const { formatDuration } = require('../../util/musicutil');
const { MessageEmbed } = require("discord.js");

exports.run = async(client, message, args) => {
    const pingMessage = await message.channel.send(`almost there...`);
    const ping = pingMessage.createdTimestamp - message.createdTimestamp;

    const embed = new MessageEmbed()
    .setDescription(`
    some additional statuses:
    > • Discord WebSocket ping: \`${client.ws.ping}\`ms
    > • shard uptime: \`${formatDuration(client.uptime)}\`
    > • this shard has \`${client.guilds.cache.size}\` guilds
    > • currently on shard \`${message.channel.type === "DM" ? 0 : message.guild.shardId}\`
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
    channelPerms: ["EMBED_LINKS"],
    aliases: [],
    cooldown: 2,
};