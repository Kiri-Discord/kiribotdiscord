require('dotenv').config();
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

global._port = process.env.PORT || 80;
global.__basedir = __dirname;
global.__baseURL = process.env.baseURL || 'https://sefy.daztopia.xyz/';

const mongo = require('./util/mongo');
const RedisClient = require('./util/redis');
mongo.init();
RedisClient.start();

require('./handler/inlineReply');
const sefy = require("./handler/ClientBuilder.js");

const client = new sefy(({ 
	disableMentions: 'everyone', 
	messageCacheLifetime: 300,
	messageSweepInterval: 120,
	ws: { 
		properties: { 
			$browser: "Discord Android" 
		}
	}
}));

require("./handler/module.js")(client);
require("./handler/Event.js")(client);
require("./handler/getUserfromMention.js")(client);

client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
