require('dotenv').config();
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

global._port = process.env.PORT || 80;
global.__basedir = __dirname;
global.__baseURL = process.env.baseURL || 'https://kiri.daztopia.xyz/';

const mongo = require('./util/mongo');
const kiri = require("./handler/ClientBuilder.js");

mongo.init();

require('./handler/inlineReply');

const client = new kiri(({
    disableMentions: 'everyone',
    ws: {
        properties: {
            $browser: "Discord Android"
        }
    }
}));
require("discord-buttons")(client);
require("./handler/module.js")(client);
require("./handler/Event.js")(client);
require("./handler/getUserfromMention.js")(client);
require("./handler/getMemberfromMention.js")();

client.package = require("./package.json");
client.on("warn", console.warn);
client.on("error", console.error);
client.login(process.env.token).catch(console.error);

module.exports = client;
