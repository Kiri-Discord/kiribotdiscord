require('dotenv').config();
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

global._port = process.env.PORT || 80;
global.__basedir = __dirname;
global.__baseURL = process.env.baseURL || 'https://sefy.daztopia.xyz/';

const mongo = require('./util/mongo');
const RedisClient = require('./util/redis');
const sefy = require("./handler/ClientBuilder.js");
const { GatewayServer, SlashCreator } = require('slash-create');
const path = require('path');

mongo.init();
RedisClient.start();

require('./handler/inlineReply');

const client = new sefy(({
	disableMentions: 'everyone',
	ws: { 
		properties: {
			$browser: "Discord Android" 
		}
	}
}));

require("./handler/module.js")(client);
require("./handler/Event.js")(client);
require("./handler/getUserfromMention.js")(client);
require("./handler/getMemberfromMention.js")();

client.package = require("./package.json");
const creator = new SlashCreator({
    applicationID: client.user.id,
    publicKey: process.env.publicKey,
    token: process.env.token
});
creator
.withServer(
	new GatewayServer(
	(handler) => client.ws.on('INTERACTION_CREATE', handler)
	)
)
.registerCommandsIn(path.join(__dirname, 'slashCommand'))
.syncCommands()
console.log('[DISCORD] Loaded slash command');

client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);

module.exports = client;