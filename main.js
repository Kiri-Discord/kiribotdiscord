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
}
const mongo = require("./util/mongo");
const Passthrough = require("./structure/Passthrough");

const passthrough = new Passthrough();

const schedule = require("node-schedule");
const guild = require("./model/guild");

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

    const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
        totalShards: 2, // or 'auto'
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
        const leftGuilds = await passthrough.db.guilds.find({
            id: { $nin: [uniqueIds] },
        });
        console.log(leftGuilds);
    }

    // if (config.emojiServerIDs) {
    //     for (const id of config.emojiServerIDs) {
    //         try {
    //             const res = await manager.broadcastEval(
    //                 async (c, context) => {
    //                     const guild = c.guilds.cache.get(context.guildId);
    //                     if (!guild) return;
    //                     const emojis = await guild.emojis.fetch();
    //                     if (!emojis || !emojis.size) return;
    //                     return emojis.map((e) => {
    //                         return {
    //                             name: e.name,
    //                             id: e.id,
    //                             animated: e.animated,
    //                         };
    //                     });
    //                 },
    //                 { context: { guildId: id } }
    //             );
    //             const emojis = res.filter((e) => Boolean(e));

    //             if (emojis.length) {
    //                 const reducedArray = emojis.reduce(
    //                     (a, b) => a.concat(b),
    //                     []
    //                 );
    //                 for (const emoji of reducedArray) {
    //                     await manager.broadcastEval(
    //                         async (c, context) => {
    //                             if (c.customEmojis.has(context.name)) return;
    //                             const CachedEmoji = require(`${context.dir}/structure/CachedEmoji.js`);
    //                             const resolvedEmoji = new CachedEmoji({
    //                                 id: context.id,
    //                                 name: context.name,
    //                                 animated: context.animated,
    //                             });
    //                             c.customEmojis.set(context.name, resolvedEmoji);
    //                             return resolvedEmoji.toString();
    //                         },
    //                         { context: { dir: process.cwd(), ...emoji } }
    //                     );
    //                 }
    //             }
    //         } catch (err) {
    //             logger.log(
    //                 "info",
    //                 `[DISCORD] Could not fetch emoji from server ${id} (error: ${err}).`
    //             );
    //         }
    //     }
    // }
    manager.broadcastEval(c => c.emit('allClusterReady'));
})();
