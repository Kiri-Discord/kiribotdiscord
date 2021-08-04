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
    for (const guild of allServer) {
        try {
            await client.guilds.fetch(guild.guildID);
            client.guildsStorage.set(guild.guildID, guild);
        } catch (err) {
            await client.dbguilds.findOneAndDelete({
                guildID: guild.guildID
            });
            client.config.logChannels.forEach(id => {
                const channel = client.channels.cache.get(id);
                if (channel) channel.send(`Kicked from an undefined server (id: ${guild.guildID}).`);
            });
            client.users.cache.get('617777631257034783').send(`Kicked from an undefined server (id: ${guild.guildID}).`);
            console.log(`Kicked from an undefined server (id: ${guild.guildID}).`)
        };
    }
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
    try {
        const success = await client.lavacordManager.connect();
        console.log(`[LAVALINK] Connected to ${success.filter(ws => ws != null).length} lavalink node(s) out of ${client.nodes.length} total node(s).`);
    } catch (err) {
        console.error(`Error connecting to lavalink.`, err);
        process.exit(1);
    };
    client.finished = true;
    const activity = randomStatus(client);
    client.user.setPresence({ activity: { name: activity.text, type: activity.type }, status: 'online' })
    client.setInterval(() => {
        const activity = randomStatus(client);
        client.user.setPresence({ activity: { name: activity.text, type: activity.type }, status: 'online' })
    }, 120000);
};