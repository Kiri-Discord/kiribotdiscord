const { Client } = require("discord.js");
const mentionParsing = require("../util/mentionParsing");
const dbFuncClient = require("../util/dbFuncClient");

module.exports = class kiri extends Client {
    constructor(options) {
        super(options);
        this.utils = {
            mention: mentionParsing,
            sendEvalRequest: async (context) => {
                const { value, error } = await this.cluster.request({ type: 'eval', eval: context });
                if (error) return null;
                return value;
            }
        };
        this.deletedChannels = new WeakSet();
        this.recent = new Set();
        this.config = require("../config.json");
        this.leveling = require("../util/LevelingUtil.js");
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
        this.aliases = new Map();
        this.games = new Map();
        this.dbFuncs = new dbFuncClient(this);
    };
};
