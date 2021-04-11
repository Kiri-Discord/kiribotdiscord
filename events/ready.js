const web = require('../util/web.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = async client => {
  if (client.user.id !== '769411215855190026') {
    console.log('[DISCORD] Fetching server...');
    const allServer = await client.dbguilds.find({});
    if (!allServer) return;
    await allServer.forEach(async guild => {
    const guilds = await client.guilds.cache.get(guild.guildID);
      if (!guilds) {
        await client.dbguilds.findOneAndDelete({
          guildID: guild.guildID
        });
        const log1 = client.channels.cache.get('768448397786349578');
        if (log1) log1.send(`Kicked from: ${guild.guildName} (id: ${guild.guildID}).`);
        client.users.cache.get('617777631257034783').send(`Kicked from: ${guild.guildName} (id: ${guild.guildID}).`);
        console.log(`Kicked from: ${guild.guildName} (id: ${guild.guildID}).`)
      }
    });
  };
  const staffsv = client.guilds.cache.get(client.config.supportServerID);
  if (staffsv) {
    await staffsv.emojis.cache.forEach(async emoji => {
      client.customEmojis.set(emoji.name, emoji.toString());
    });
    console.log(`[DISCORD] Added ${client.customEmojis.size} custom emojis`)
  };
  
  console.log(`[DISCORD] Fetching all unverified members..`);
  await client.verifytimers.fetchAll();
  console.log(`[DISCORD] Logged in as ${client.user.tag}!`);
  web.init(client);
  client.activities.push(
    { text: () => `stayed awake for ${moment.duration(client.uptime).format('H [hrs]')}`, type: 'PLAYING' },
    { text: () => `@Sefy`, type: 'LISTENING' },
    { text: () => `to your heart`, type: 'LISTENING' },
	);
  client.setInterval(() => {
		const activity = client.activities[Math.floor(Math.random() * client.activities.length)];
		const text = typeof activity.text === 'function' ? activity.text() : activity.text;
		client.user.setActivity(text, { type: activity.type });
	}, 180000);
};