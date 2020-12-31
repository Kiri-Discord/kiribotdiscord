module.exports = async client => {
  await client.verifytimers.fetchAll();
  console.log(`[DISCORD] Logged in as ${client.user.tag}!`);
  client.user.setPresence({ activity: { name: 'you smile', type: "WATCHING" }, status: 'idle' })
}