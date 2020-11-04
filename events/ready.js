

module.exports = client => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('so call me maybe', { type: 'WATCHING', browser: "DISCORD IOS" }).catch(console.error);
}
