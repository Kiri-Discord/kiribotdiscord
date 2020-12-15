module.exports = client => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ activity: { name: 'you smile', type: "WATCHING" }, status: 'idle' })
}