process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

global.__basedir = __dirname;
require('dotenv').config();
const express = require('express');
const mongo = require('./util/mongo.js');
const RedisClient = require('./util/redis');
mongo.init();
RedisClient.start();
const sefy = require("./handler/ClientBuilder.js");
const client = new sefy(({ disableMentions: 'everyone' }), { ws: { properties: { $browser: "Discord Android" }} });
client.loadTopics('./assets/trivia/');
client.webapp.use(express.json());

require("./handler/module.js")(client);
require("./handler/Event.js")(client);
client.webapp.get('/', (_, res) => res.sendFile(__dirname + '/html/landing.html'));
client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
client.webapp.listen(80);
