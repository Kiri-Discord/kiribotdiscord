const Discord = require("discord.js");
const mongoose = require('mongoose');
const sefy = require("./handler/ClientBuilder.js");
const client = new sefy();
const mongo = require('./utils/mongo.js')

require("./handler/module.js")(client);
require("./handler/Event.js")(client);


client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
mongo.init();
