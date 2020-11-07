
module.exports = client => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('over you all', { type: 'WATCHING', browser: "DISCORD IOS" }).catch(console.error);
}
