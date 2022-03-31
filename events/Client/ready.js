const { purgeDbGuild } = require('../../util/util');
const music = require('../../util/music');
const schedule = require('node-schedule');
const request = require('node-superfetch');

module.exports = async client => {
    logger.log('info', `[DISCORD] Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activities: [{ name: 'waking up' }], status: 'dnd' });

    if (process.env.NOLAVA !== 'true') await music.init(client);

    schedule.scheduleJob('*/60 * * * *', async() => {
        if (!client.isReady()) return;
        try {
            const { body } = await request.get('https://kaomoji.party/api/getKaomoji');
            const { kaomoji } = body;
            return client.user.setPresence({ activities: [{ name: `${kaomoji} (${client.cluster.id})`, type: 'PLAYING' }], status: 'online' });
        } catch {
            return;
        };
    });
    try {
        const { body } = await request.get('https://kaomoji.party/api/getKaomoji');
        const { kaomoji } = body;
        return client.user.setPresence({ activities: [{ name: `${kaomoji} (${client.cluster.id})`, type: 'PLAYING' }], status: 'online' });
    } catch {
        client.user.setPresence({ activities: [{ name: `;-; (${client.cluster.id})`, type: 'WATCHING' }], status: 'online' });
    };
};