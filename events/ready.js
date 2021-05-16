const web = require('../util/web.js');
const { randomStatus, botSitePost } = require('../util/util');
const { GatewayServer, SlashCreator } = require('slash-create');
const path = require('path');

module.exports = async client => {
  console.log(`[DISCORD] Logged in as ${client.user.tag}!`);
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
    botSitePost(client);
    client.setInterval(() => botSitePost(client), 1200000);
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
  web.init(client);
  client.user.setActivity('just woke up...', { type: 'PLAYING' });
  client.setInterval(() => {
    const activity = randomStatus(client);
		client.user.setActivity(activity.text, { type: activity.type });
	}, 120000);
  const creator = new SlashCreator({
    applicationID: client.user.id,
    publicKey: process.env.publicKey,
    token: process.env.token
  });
  creator
  .withServer(
      new GatewayServer(
        (handler) => client.ws.on('INTERACTION_CREATE', handler)
      )
  )
  .registerCommandsIn(path.join(__dirname, '..', 'slashCommand'))
  .syncCommands()
  console.log('[DISCORD] Loaded slash command')
};
