global.__basedir = __dirname;
require('dotenv').config()
const mongo = require('./util/mongo.js');
const RedisClient = require('./util/redis');
mongo.init();
RedisClient.start();
const sefy = require("./handler/ClientBuilder.js");
const client = new sefy(({ disableMentions: 'everyone' }));


require("./handler/module.js")(client);
require("./handler/Event.js")(client);

client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
client.loadTopics('./assets/trivia/');