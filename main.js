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
const passthrough = new Passthrough();

global.passthrough = passthrough;

const cachedEmojis = new Map();

global.cachedEmojis = cachedEmojis;

const schedule = require("node-schedule");

(async () => {
    await mongo.init();

    schedule.scheduleJob("0 0 1 * *", async () => {
        let storage = await passthrough.db.globalStorage.findOne();
        if (!storage) {
            storage = new passthrough.db.globalStorage();
            storage.lastChartReset = Date.now();
            await storage.save();
            await passthrough.db.charts.deleteMany({});
        } else {
            if (!storage.lastChartReset) {
                storage.lastChartReset = Date.now();
                await storage.save();
                return passthrough.db.charts.deleteMany({});
            }
            const lastReset = new Date(storage.lastChartReset);
            const today = new Date(Date.now());
            if (today.getUTCMonth() === lastReset.getUTCMonth()) {
                return;
            } else {
                storage.lastChartReset = Date.now();
                await storage.save();
                await passthrough.db.charts.deleteMany({});
            }
        }
        logger.log("info", "[MUSIC] Deleted all charts!");
    });

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
        shardsPerClusters: 1,
        mode: "process",
        token: config.token,
    });
    require("./handler/Event.js")(manager, true);
    
    await manager.spawn({ timeout: -1 });

    logger.info("[MANAGER] Removing left server from database...");

    const res = await manager.broadcastEval(
        async (c, context) => {
            try {
                const guilds = await c.guilds.fetch();
                if (!guilds || !guilds.size) return;
                return guilds.map((g) => g.id);
            } catch (err) {
                return;
            }
        }
    );
    const guildIDs = res.filter((r) => r);
    if (guildIDs.length) {
        const uniqueIds = [...new Set(guildIDs.reduce((a, b) => a.concat(b), []))];
        await passthrough.dbFuncs.purgeNonExistingGuilds(uniqueIds);
    };
})();

// exports.passthrough = passthrough;
// exports.cachedEmojis = cachedEmojis;
