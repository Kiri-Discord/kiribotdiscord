const Discord = require("discord.js");
const sefy = require("./handler/ClientBuilder.js"); // We're gonna create this soon.
const client = new sefy();

require("./handler/module.js")(client);
require("./handler/Event.js")(client);


client.on("warn", console.warn); // This will warn you via logs if there was something wrong with your bot.
client.on("error", console.error); // This will send you an error message via logs if there was something missing with your coding.
client.login(process.env.token).catch(console.error); // This token will leads to the .env file. It's safe in there.
