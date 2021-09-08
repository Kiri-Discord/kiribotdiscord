const { purgeDbGuild } = require('../util/util');

module.exports = async(client, guild) => {
    await purgeDbGuild(client, guild.id);
    console.log(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    const owner = client.users.cache.get(client.config.ownerID);
    if (owner) owner.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.config.logChannels.forEach(id => {
        const channel = client.channels.cache.get(id);
        if (channel) channel.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    });
};