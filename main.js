require("dotenv").config();

process.on("unhandledRejection", (error) => {
    logger.error(error);
});

global.__basedir = __dirname;

const winston = require("winston");
require("winston-daily-rotate-file");
const config = require("./config.json");
const fs = require("fs");

if (!fs.existsSync("logs")) fs.mkdirSync("logs");

if (!fs.existsSync("logs/output")) fs.mkdirSync("logs/output");
if (!fs.existsSync("logs/error")) fs.mkdirSync("logs/error");

const errorStackFormat = winston.format((info) => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message,
            error: true,
        });
    }
    return info;
});

global.logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
        }),
        new winston.transports.DailyRotateFile({
            filename: "logs/output/output-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            frequency: "24h",
            maxSize: "20m",
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
        }),
        new winston.transports.DailyRotateFile({
            filename: "logs/error/error-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            maxSize: "20m",
            frequency: "24h",
            level: "error",
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                winston.format.simple()
            ),
            handleExceptions: true,
        }),
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        errorStackFormat(),
        winston.format.printf(
            (log) =>
                `${log.timestamp} ${log.level.toUpperCase()}: ${log.message}${
                    log.error ? `\n${log.stack}` : ""
                }`
        )
    ),
});

if (config.sentryDSNURL && process.env.NO_SENTRY !== "true") {
    const sentry = require("@sentry/node");
    sentry.init({
        dsn: config.sentryDSNURL,
        tracesSampleRate: 0.8,
    });
    logger.log("info", "[SENTRY] Initialized!");
}
const Heatsync = require("heatsync");
const sync = new Heatsync();

sync.events.on("error", logger.error);
sync.events.on("any", (file) => logger.info(`${file} was changed`));
global.sync = sync;

const mongo = require("./util/mongo");
const kiri = require("./handler/ClientBuilder.js");
const schedule = require("node-schedule");
const { AutoPoster } = require("topgg-autoposter");
const { Intents, Sweepers } = require("discord.js");

const intents = new Intents();

intents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES
);

const client = new kiri({
    intents,
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
    },
    ws: {
        properties: {
            $browser: "Discord Android",
        },
    },
    sweepers: {
        messages: {
            interval: 300,
            filter: Sweepers.filterByLifetime({
                lifetime: 1800,
                getComparisonTimestamp: (e) =>
                    e.editedTimestamp ?? e.createdTimestamp,
            }),
        },
    },
});
client.on("warn", (warn) => logger.log("warn", warn));
client.on("error", (err) => logger.log("error", err));

require("./handler/module.js")(client);
require("./handler/Event.js")(client);

if (config.topggkey && process.env.NO_TOPGG !== "true") {
    const ap = AutoPoster(config.topggkey, client);

    ap.on("posted", () => {
        logger.info("Posted stats to Top.gg!");
    });
}

(async () => {
    await mongo.init();

    schedule.scheduleJob("0 0 1 * *", async () => {
        let storage = await client.db.globalStorage.findOne();
        if (!storage) {
            storage = new client.db.globalStorage();
            storage.lastChartReset = Date.now();
            await storage.save();
            await client.db.charts.deleteMany({});
        } else {
            if (!storage.lastChartReset) {
                storage.lastChartReset = Date.now();
                await storage.save();
                return client.db.charts.deleteMany({});
            }
            const lastReset = new Date(storage.lastChartReset);
            const today = new Date(Date.now());
            if (today.getUTCMonth() === lastReset.getUTCMonth()) {
                return;
            } else {
                storage.lastChartReset = Date.now();
                await storage.save();
                await client.db.charts.deleteMany({});
            }
        }
        logger.log("info", "[MUSIC] Deleted all charts!");
    });

    client.login(config.token).catch((err) => logger.log("error", err));
})();

module.exports = client;
