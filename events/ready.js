const web = require('../util/web.js');
const { randomStatus, botSitePost } = require('../util/util');
const slash = require('../util/slash');
const giveaway = require('../util/giveaway');

module.exports = async client => {
    console.log(`[DISCORD] Logged in as ${client.user.tag}!`);
    client.finished = false;
    client.user.setPresence({ activity: { name: 'waking up' }, status: 'dnd' });
    console.log('[DISCORD] Fetching server...');
    const allServer = await client.dbguilds.find({});
    if (!allServer) return;
    await allServer.forEach(async guild => {
        const server = await client.guilds.fetch(guild.guildID);
        if (!server) {
            await client.dbguilds.findOneAndDelete({
                guildID: guild.guildID
            });
            client.config.logChannels.forEach(id => {
                const channel = client.channels.cache.get(id);
                if (channel) channel.send(`Kicked from: "" (id: ${guild.guildID}).`);
            });
            client.users.cache.get('617777631257034783').send(`Kicked from: ${guild.guildName} (id: ${guild.guildID}).`);
            console.log(`Kicked from: ${guild.guildName} (id: ${guild.guildID}).`)
        } else {
            client.guildsStorage.set(guild.guildID, guild);
        }
    });
    if (!client.config.development) {
        botSitePost(client);
        client.setInterval(() => botSitePost(client), 1200000);
    };
    const staffsv = client.guilds.cache.get(client.config.supportServerID);
    if (staffsv) {
        await staffsv.emojis.cache.forEach(async emoji => {
            client.customEmojis.set(emoji.name, emoji);
        });
        console.log(`[DISCORD] Added ${client.customEmojis.size} custom emojis`)
    };
    console.log(`[DISCORD] Fetching all unverified members..`);
    await client.verifytimers.fetchAll();
    slash.init(client);
    web.init(client);
    giveaway.init(client);
    client.finished = true;
    const activity = randomStatus(client);
    client.user.setPresence({ activity: { name: activity.text, type: activity.type }, status: 'online' })
    client.setInterval(() => {
        const activity = randomStatus(client);
        client.user.setPresence({ activity: { name: activity.text, type: activity.type }, status: 'online' })
    }, 120000);
};