const fs = require("fs");

if (!fs.existsSync("logs")) fs.mkdirSync("logs");

if (!fs.existsSync("logs/output")) fs.mkdirSync("logs/output");
if (!fs.existsSync("logs/error")) fs.mkdirSync("logs/error");

global.logger = require("./structure/Logger");
require("dotenv").config();

process.on("unhandledRejection", (error) => {
    logger.error(error);
});

const Cluster = require("discord-hybrid-sharding");
const config = require("./config.json");

if (config.sentryDSNURL && process.env.NO_SENTRY !== "true") {
    const sentry = require("@sentry/node");
    sentry.init({
        dsn: config.sentryDSNURL,
        tracesSampleRate: 0.8,
    });
    logger.log("info", "[SENTRY] Initialized on manager");
};

const mongo = require("./util/mongo");
const request = require('node-superfetch');

const Passthrough = require("./structure/Passthrough");

const schedule = require("node-schedule");

const { glob } = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);
const passthrough = new Passthrough();

const cachedEmojis = new Map();

(async () => {
    await mongo.init();
    // schedule.scheduleJob("0 0 1 * *", async () => {
    //     let storage = await passthrough.db.globalStorage.findOne();
    //     if (!storage) {
    //         storage = new passthrough.db.globalStorage();
    //         storage.lastChartReset = Date.now();
    //         await storage.save();
    //         await passthrough.db.charts.deleteMany({});
    //     } else {
    //         if (!storage.lastChartReset) {
    //             storage.lastChartReset = Date.now();
    //             await storage.save();
    //             return passthrough.db.charts.deleteMany({});
    //         }
    //         const lastReset = new Date(storage.lastChartReset);
    //         const today = new Date(Date.now());
    //         if (today.getUTCMonth() === lastReset.getUTCMonth()) {
    //             return;
    //         } else {
    //             storage.lastChartReset = Date.now();
    //             await storage.save();
    //             await passthrough.db.charts.deleteMany({});
    //         }
    //     }
    //     logger.log("info", "[MUSIC] Deleted all charts!");
    // });

    if (config.emojiServerIDs) {
        for (const id of config.emojiServerIDs) {
            try {
                const { body } = await request
                    .get(`https://discord.com/api/v9/guilds/${id}/emojis`)
                    .set({ Authorization: `Bot ${config.token}` });
                if (!body.length) continue;
                else {
                    body.forEach(emoji => cachedEmojis.set(emoji.id, {
                        id: emoji.id,
                        name: emoji.name,
                        animated: emoji.animated
                    }));
                };
                logger.info(`[DISCORD] Loaded ${body.length} emojis from server ${id}`);
            } catch (err) {
                logger.info(`[DISCORD] Could not fetch emoji from server ${id} (error: ${err}).`);
            }
        }
    }


    const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
        totalShards: 2,
        totalClusters: 2,
        mode: "process",
        token: config.token,
    });
    manager.passthrough = passthrough;
    manager.ipcScripts = new Map();
    manager.cachedEmojis = cachedEmojis;
    require("./handler/Event.js")(manager, true);

    const scripts = await globPromise(`${process.cwd()}/managerMessages/*.js`);

    if (scripts.length) {
        scripts.forEach(file => {
            const script = require(file);
            manager.ipcScripts.set(script.name, script);
        });
        logger.info(`Found ${scripts.length} IPC messages scripts`);
    };
    await manager.spawn({ timeout: -1 });

    // const res = await manager.broadcastEval(
    //     (c) => {
    //         try {
    //             const guilds = c.guilds.cache;
    //             if (!guilds || !guilds.size) return;
    //             return guilds.map((g) => g.id);
    //         } catch (err) {
    //             return;
    //         }
    //     }
    // );
    // const guildIDs = res.filter((r) => r);
    // if (guildIDs.length) {
    //     const uniqueIds = [...new Set(guildIDs.reduce((a, b) => a.concat(b), []))];
    //     const deletedCount = await passthrough.dbFuncs.purgeNonExistingGuilds(uniqueIds);

    //     if (deletedCount) logger.info(`[MONGO] Removed ${deletedCount} left server from database.`);
    // };
})();