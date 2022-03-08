const { Client, Collection } = require("discord.js");
const PokemonStore = require("../features/pokemon/pokemonstore");
const { parseMember } = require("../util/mentionParsing");
const DataManager = require("../features/genshin/DataManager");
const web = require('../util/web.js');
module.exports = class kiri extends Client {
    constructor(options) {
        super(options);
        this.web = web;
        this.utils = {
            parseMember,
        };
        this.db = {
            levelingRewards: require("../model/levelingRewards"),
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
        this.slashHelps = new Map();
        this.queue = new Map();
        this.commands = new Map();
        this.slash = new Map();
        this.helps = new Map();
        this.customEmojis = new Map();
        this.allNameCmds = [];
        this.allSlashCmds = [];
        this.guildsStorage = new Map();
        this.aliases = new Map();
        this.config = require("../config.json");
        this.recent = new Set();
        this.leveling = require("../util/LevelingUtil.js");
        this.games = new Map();
        this.pokemon = new PokemonStore();
    }
};
