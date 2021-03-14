process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

global.__basedir = __dirname;
const port = 80;
// require('dotenv').config(); uncomment if you dont deploy the app through pm2
const mongo = require('./util/mongo.js');
const RedisClient = require('./util/redis');
mongo.init();
RedisClient.start();
const sefy = require("./handler/ClientBuilder.js");
const client = new sefy(({ disableMentions: 'everyone' }), { ws: { properties: { $browser: "Discord Android" }} });


require("./handler/module.js")(client);
require("./handler/Event.js")(client);

client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
client.loadTopics('./assets/trivia/');
