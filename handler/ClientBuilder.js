const { Client, Collection } = require("discord.js");
const PokemonStore = require("../features/pokemon/pokemonstore");
const VerifyTimer = require("../features/redis/verify");
const { parseMember } = sync.require("../util/mentionParsing");
const DataManager = require("../features/genshin/DataManager");
module.exports = class kiri extends Client {
    constructor(options) {
        super(options);
        this.utils = {
            parseMember,
        };
        this.genshinData = new DataManager();
        this.nodes = require("../lavalinkNodes.json");
        this.vote = require("../model/vote");
        this.isPlaying = new Map();
        this.dcTimeout = new Map();
        this.charts = require("../model/chart");
        this.globalStorage = require("../model/global");
        this.gameStorage = require("../model/game");
        this.slashHelps = new Collection();
        this.queue = new Map();
        this.dbembeds = require("../model/embeds");
        this.commands = new Map();
        this.slash = new Collection();
        this.cooldowns = require("../model/cooldown");
        this.inventory = require("../model/inventory");
        this.garden = require("../model/garden");
        this.helps = new Map();
        this.customEmojis = new Map();
        this.allNameCmds = [];
        this.allSlashCmds = [];
        this.guildsStorage = new Collection();
        this.aliases = new Map();
        this.config = require("../config.json");
        this.recent = new Set();
        this.money = require("../model/currency");
        this.love = require("../model/love");
        this.dbguilds = require("../model/guild");
        this.leveling = require("../util/LevelingUtil.js");
        this.dbleveling = require("../model/leveling");
        this.dbverify = require("../model/verify");
        this.games = new Collection();
        this.pokemon = new PokemonStore();
        this.verifytimers = new VerifyTimer(this);
    }
};
