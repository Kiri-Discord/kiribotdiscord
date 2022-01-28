const { Client, Collection } = require("discord.js");
const PokemonStore = require("../features/pokemon/pokemonstore");
const { parseMember } = require("../util/mentionParsing");
const DataManager = require("../features/genshin/DataManager");
module.exports = class kiri extends Client {
    constructor(options) {
        super(options);
        this.utils = {
            parseMember,
        };
        this.db = {
            vote: require("../model/vote"),
            globalStorage: require("../model/global"),
            gameStorage: require("../model/game"),
            charts: require("../model/chart"),
            embeds: require("../model/embeds"),
            cooldowns: require("../model/cooldown"),
            inventory: require("../model/inventory"),
            garden: require("../model/garden"),
            money: require("../model/currency"),
            love: require("../model/love"),
            guilds: require("../model/guild"),
            leveling: require("../model/leveling")
        }
        this.genshinData = new DataManager();
        this.deletedChannels = new WeakSet();
        this.nodes = require("../lavalinkNodes.json");
        this.isPlaying = new Map();
        this.dcTimeout = new Map();
        this.slashHelps = new Collection();
        this.queue = new Map();
        this.commands = new Map();
        this.slash = new Collection();
        this.helps = new Map();
        this.customEmojis = new Map();
        this.allNameCmds = [];
        this.allSlashCmds = [];
        this.guildsStorage = new Collection();
        this.aliases = new Map();
        this.config = require("../config.json");
        this.recent = new Set();
        this.leveling = require("../util/LevelingUtil.js");
        this.games = new Collection();
        this.pokemon = new PokemonStore();
    }
};
