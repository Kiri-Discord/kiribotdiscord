const web = require('../util/web.js');
const { randomStatus, purgeDbGuild } = require('../util/util');
const music = require('../util/music');

module.exports = async client => {
    logger.log('info', `[DISCORD] Logged in as ${client.user.tag}!`);
    client.finished = false;
    client.user.setPresence({ activities: [{ name: 'waking up' }], status: 'dnd' });
    logger.log('info', '[DISCORD] Fetching server...');
    const allServer = await client.dbguilds.find({});
    if (allServer.length) {
        for (const guild of allServer) {
            try {
                await client.guilds.fetch(guild.guildID);
                client.guildsStorage.set(guild.guildID, guild);
            } catch (err) {
                await purgeDbGuild(client, guild.guildID);
                client.config.logChannels.forEach(id => {
                    const channel = client.channels.cache.get(id);
                    if (channel) channel.send(`Kicked from an undefined server (id: ${guild.guildID}).`);
                });
                const owner = client.users.cache.get(client.config.ownerID);
                if (owner) owner.send(`Kicked from an undefined server (id: ${guild.guildID}).`);
                logger.log('info', `Kicked from an undefined server (id: ${guild.guildID}).`);
            };
        }
    };
    if (client.config.emojiServerIDs) {
        for (const id of client.config.emojiServerIDs) {
            try {
                const guild = await client.guilds.fetch(id);
                const emojis = await guild.emojis.fetch();
                emojis.each(emoji => client.customEmojis.set(emoji.name, emoji));
                logger.log('info', `[DISCORD] Loaded ${emojis.size} custom emojis from ${guild.name} (id: ${id})`);
            } catch (err) {
                logger.log('info', `[DISCORD] Could not fetch emoji server (id: ${id}).`);
            };
        };
    };
    if (process.env.NO_WEB_SERVER !== 'true') {
        logger.log('info', `[DISCORD] Fetching all unverified members..`);
        await client.verifytimers.fetchAll();
        web.init(client);
    };
    await client.initGiveaway();
    if (process.env.NOLAVA !== 'true') await music.init(client);
    client.finished = true;
    client.user.setPresence({ activities: [{ name: ';-;', type: 'WATCHING' }], status: 'online' });
};