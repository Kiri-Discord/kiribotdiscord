module.exports = client => {
  console.log("The bot is ready!");

  client.user.setPresence({
      game: { 
          name: 'so call me maybe',
          type: 'LISTENING'
      },
      status: 'idle'
    })
}
