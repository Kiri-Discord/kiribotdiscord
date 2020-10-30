module.exports = client => {
  console.log("The bot is ready!");
  client.user.setActivity('so call me maybe', { type: 'WATCHING'}).catch(console.error);
}
