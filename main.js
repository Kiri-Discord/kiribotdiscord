require('dotenv').config();
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

global._port = process.env.PORT || 80;
global.__basedir = __dirname;
global.__baseURL = process.env.baseURL || 'https://kiri.daztopia.xyz/';

const mongo = require('./util/mongo');
const RedisClient = require('./util/redis');
const kiri = require("./handler/ClientBuilder.js");
const { Intents } = require('discord.js');

mongo.init();
RedisClient.start();

require('./handler/inlineReply');

const client = new kiri(({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
    ],
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