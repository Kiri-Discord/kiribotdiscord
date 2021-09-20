const winston = require('winston');

global.logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

require('dotenv').config();
process.on('unhandledRejection', error => {
    client.channels.cache.get('833003165565583362').send(`${error}`)
    console.error('Unhandled promise rejection:', error);
});

global._port = process.env.PORT || 80;
global.__basedir = __dirname;
global.__baseURL = process.env.baseURL || 'https://kiribot.xyz/';

const mongo = require('./util/mongo');
const kiri = require("./handler/ClientBuilder.js");
const { Intents, Options } = require('discord.js');
const intents = new Intents();

intents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
);

const client = new kiri({
    intents,
    makeCache: Options.cacheWithLimits({
        MessageManager: 180,
    }),
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    },
    ws: {
        properties: {
            $browser: "Discord Android"
        }
    }

});
require("./handler/module.js")(client);
require("./handler/Event.js")(client);
require("./handler/getUserfromMention.js")(client);
require("./handler/getMemberfromMention.js")();
client.package = require("./package.json");
client.on("warn", warn => logger.log('warn', warn));
client.on("error", err => {
    logger.log('error', err)
});
(async() => {
    await mongo.init();
    client.login(process.env.token).catch(err => logger.log('error', err));
})();
module.exports = client;
