module.exports = async(client, guild) => {
    if (!client.isReady()) return;
    const queue = client.queue.get(guild.id);
    if (queue) queue.stop('disconnected');
    
    await client.dbFuncs.purgeGuild(guild.id);
    logger.log('info', `Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members! (shard: ${guild.shardId}, cluster: ${client.cluster.id})`);

    client.config.logChannels.forEach(async id => {
        await client.cluster.broadcastEval((c, context) => {
            const channel = c.channels.cache.get(context.channelId);
            try {
                if (channel) return channel.send(`Guild left: ${context.guildName} (id: ${context.guildId}). This guild has ${context.memberCount} members! (shard: ${context.shardId}, cluster: ${context.clusterId})`);
                else return false;
            } catch (error) {
                console.log(error)
                return false;
            }
        }, { context: { channelId: id, guildName: guild.name, guildId: guild.id, memberCount: guild.memberCount, shardId: guild.shardId, clusterId: client.cluster.id } });
    });
    // const owner = client.users.cache.get(client.config.ownerID);
    // if (owner) owner.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    // client.config.logChannels.forEach(id => {
    //     const channel = client.channels.cache.get(id);
    //     if (channel) channel.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    // });
};
