module.exports = client => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ activity: { name: 'my loneliness', type: "COMPETING" }, status: 'idle' })
}