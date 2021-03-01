module.exports = async client => {
  console.log('[DISCORD] Fetching server...')
  const allServer = await client.dbguilds.find({})
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
  await client.verifytimers.fetchAll();
  console.log(`[DISCORD] Logged in as ${client.user.tag}!`);
  client.user.setPresence({ activity: { name: 'with the clouds', type: "PLAYING" }, status: 'idle' })
}