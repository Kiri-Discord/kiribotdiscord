module.exports = async(client, channel) => {
    client.deletedChannels.add(channel);
    if (!channel.guildId) return;
    client.games.delete(channel.id);
    const queue = client.queue.get(channel.guildId);
    if (!queue) return;
    if (queue.channel.id === channel.id) {
        return queue.stop('disconnected');
    };
};