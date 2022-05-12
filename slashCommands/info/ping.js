const { SlashCommandBuilder } = require('@discordjs/builders');
const { formatDuration } = require('../../util/musicutil');

exports.run = async(client, interaction) => {
    const pingMessage = await interaction.reply({ content: `almost there...`, fetchReply: true });
    const createdTimestamp = pingMessage.createdTimestamp || new Date(pingMessage.timestamp).getTime();
    const ping = createdTimestamp - interaction.createdTimestamp;
    const embed = new MessageEmbed()
    .setDescription(`
    some additional statuses:
    > • Discord WebSocket ping: \`${client.ws.ping}\`ms
    > • cluster uptime: \`${formatDuration(client.uptime)}\`
    > • this cluster has \`${client.guilds.cache.size}\` guilds
    > • currently on shard \`${interaction.guild.shardId + 1}\` of cluster \`${client.cluster.id + 1}\` out of \`${client.cluster.count}\` clusters
    `)
    return pingMessage.edit({ content: `pong! took me \`${ping}\`ms!`, embeds: [embed] });
};
exports.help = {
    name: "ping",
    description: "ping me and check if i'm actually alive or not",
    usage: ["ping"],
    example: ["ping"]
};

exports.conf = {
    cooldown: 2,
    data: new SlashCommandBuilder()
        .setName(exports.help.name).setDescription(exports.help.description),
};