const Constants = require('discord.js/src/util/Constants.js')
Constants.DefaultOptions.ws.properties.$browser = `Discord iOS`

module.exports = client => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('so call me maybe', { type: 'WATCHING'}).catch(console.error);
}
