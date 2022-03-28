const logger = require('./structure/Logger');

process.on("unhandledRejection", (error) => {
    logger.error(error);
});

const kiri = require("./structure/Client.js");
const { Intents, Sweepers } = require("discord.js");
const Cluster = require('discord-hybrid-sharding');
const config = require("./config.json");

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
    shards: Cluster.data.SHARD_LIST,
    shardCount: Cluster.data.TOTAL_SHARDS,
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
                lifetime: 900,
                getComparisonTimestamp: (e) =>
                    e.editedTimestamp ?? e.createdTimestamp,
            }),
        },
    },
});

const Heatsync = require("heatsync");
const sync = new Heatsync();
sync.events.on("error", logger.error);
sync.events.on("any", (file) => logger.info(`${file} was changed`));

global.sync = sync;


client.on("warn", (warn) => logger.warn(warn));
client.on("error", (err) => logger.error(err));

client.cluster = new Cluster.Client(client);
client.login(config.token);
