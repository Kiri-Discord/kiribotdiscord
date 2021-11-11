module.exports = async(client, channel) => {
    if (!channel.guildId) return;
    client.games.delete(channel.id);
    const queue = client.queue.get(channel.guildId);
    if (!queue) return;
    if (queue.channel.id === channel.id) {
        if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
        if (queue.dcTimeout) clearTimeout(queue.dcTimeout);
        return queue.stop('disconnected');
    };
};