const winston = require('winston');
const config = require('./config.json');

global.logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

require('dotenv').config();
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

global.__basedir = __dirname;

if (config.sentryDSNURL && process.env.NO_SENTRY !== 'true') {
    global.sentry = require("@sentry/node");
    sentry.init({
        dsn: config.sentryDSNURL,
        tracesSampleRate: 0.7,
    });
    logger.log('info', '[SENTRY] Initialized!')
};

const mongo = require('./util/mongo');
const kiri = require("./handler/ClientBuilder.js");
const { AutoPoster } = require('topgg-autoposter');
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

client.on("warn", warn => logger.log('warn', warn));
client.on("error", err => {
    logger.log('error', err)
});
require("./handler/module.js")(client);
require("./handler/Event.js")(client);
require("./handler/getUserfromMention.js")(client);
require("./handler/getMemberfromMention.js")();
if (config.topggkey && process.env.NO_TOPGG !== 'true') {
    const ap = AutoPoster(config.topggkey, client);

    ap.on('posted', () => {
        logger.log('info', 'Posted stats to Top.gg!');
    });
};

(async() => {
    await mongo.init();
    client.login(config.token).catch(err => logger.log('error', err));
})();
module.exports = client;