module.exports = client => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
      status: "idle",  // You can show online, idle... Do not disturb is dnd
      game: {
          name: "so call me maybe",  // The message shown
          type: "LISTENING" // PLAYING, WATCHING, LISTENING, STREAMING,
      }
  });
};
