
const sefy = require("./handler/ClientBuilder.js");
const client = new sefy();
const mongo = require('./util/mongo.js');
global.__basedir = __dirname;

require("./handler/module.js")(client);
require("./handler/Event.js")(client);
require('dotenv').config()


client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
mongo.init();
client.loadTopics('./assets/trivia/');