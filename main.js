require('dotenv').config();

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

global.__basedir = __dirname;

const winston = require('winston');
const config = require('./config.json');
const fs = require('fs');

const logDir = "logs";

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
};

global.logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            handleExceptions: true
        }),
        new(require("winston-daily-rotate-file"))({
            filename: `${logDir}/-results.log`,
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            )
        }),
        new winston.transports.File({
            filename: `${logDir}/error.log`,
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple(),
            ),
            handleExceptions: true
        }),
    ],
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
});


if (config.sentryDSNURL && process.env.NO_SENTRY !== 'true') {
    const sentry = require("@sentry/node");
    sentry.init({
        dsn: config.sentryDSNURL,
        tracesSampleRate: 0.8,
    });
    logger.log('info', '[SENTRY] Initialized!')
};
const Heatsync = require("heatsync");
const sync = new Heatsync();

sync.events.on("error", logger.error)
sync.events.on("any", (file) => logger.info(`${file} was changed`));
global.sync = sync;


const mongo = require('./util/mongo');
const kiri = require("./handler/ClientBuilder.js");
const schedule = require('node-schedule');
const { AutoPoster } = require('topgg-autoposter');
const { Intents, Options } = require('discord.js');

const intents = new Intents();

intents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_INVITES,
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

    schedule.scheduleJob('0 0 1 * *', async() => {
        let storage = await client.globalStorage.findOne();
        if (!storage) {
            storage = new client.globalStorage();
            storage.lastChartReset = Date.now();
            await storage.save();
            await client.charts.deleteMany({});
        } else {
            if (!storage.lastChartReset) {
                storage.lastChartReset = Date.now();
                await storage.save();
                return client.charts.deleteMany({});
            };
            const lastReset = new Date(storage.lastChartReset);
            const today = new Date(Date.now());
            if (today.getUTCMonth() === lastReset.getUTCMonth()) {
                return;
            } else {
                storage.lastChartReset = Date.now();
                await storage.save();
                await client.charts.deleteMany({});
            }
        };
        logger.log('info', '[MUSIC] Deleted all charts!');
    });

    client.login(config.token).catch(err => logger.log('error', err));
})();

module.exports = client;