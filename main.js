const fs = require("fs");

if (!fs.existsSync("logs")) fs.mkdirSync("logs");

if (!fs.existsSync("logs/output")) fs.mkdirSync("logs/output");
if (!fs.existsSync("logs/error")) fs.mkdirSync("logs/error");

global.logger = require('./structure/Logger');
require("dotenv").config();

process.on("unhandledRejection", (error) => {
    logger.error(error);
});

const Cluster = require('discord-hybrid-sharding');
const config = require("./config.json");


if (config.sentryDSNURL && process.env.NO_SENTRY !== "true") {
    const sentry = require("@sentry/node");
    sentry.init({
        dsn: config.sentryDSNURL,
        tracesSampleRate: 0.8,
    });
    logger.log("info", "[SENTRY] Initialized!");
}
const mongo = require("./util/mongo");


// const schedule = require("node-schedule");
// const { AutoPoster } = require("topgg-autoposter");

// require("./handler/module.js")(client);
// require("./handler/Event.js")(client);

// if (config.topggkey && process.env.NO_TOPGG !== "true") {
//     const ap = AutoPoster(config.topggkey, client);

//     ap.on("posted", () => {
//         logger.info("Posted stats to Top.gg!");
//     });
// }



// schedule.scheduleJob("0 0 1 * *", async () => {
//     let storage = await client.db.globalStorage.findOne();
//     if (!storage) {
//         storage = new client.db.globalStorage();
//         storage.lastChartReset = Date.now();
//         await storage.save();
//         await client.db.charts.deleteMany({});
//     } else {
//         if (!storage.lastChartReset) {
//             storage.lastChartReset = Date.now();
//             await storage.save();
//             return client.db.charts.deleteMany({});
//         }
//         const lastReset = new Date(storage.lastChartReset);
//         const today = new Date(Date.now());
//         if (today.getUTCMonth() === lastReset.getUTCMonth()) {
//             return;
//         } else {
//             storage.lastChartReset = Date.now();
//             await storage.save();
//             await client.db.charts.deleteMany({});
//         }
//     }
//     logger.log("info", "[MUSIC] Deleted all charts!");
// });

// client.login(config.token).catch((err) => logger.log("error", err));



(async () => {
    await mongo.init();

    const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
        totalShards: 2,
        shardsPerClusters: 1,
        mode: 'process',
        token: config.token,
    });
    manager.on('debug', cluster => logger.info(cluster));
    manager.spawn({ timeout: -1 });
    
})();