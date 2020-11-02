module.exports = client => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
      status: "online", 
      game: {
          name: "so call me maybe",  
          type: "LISTENING" 
      }
  });
};
