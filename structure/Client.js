const { Client } = require("discord.js");
const mentionParsing = require("../util/mentionParsing");
module.exports = class kiri extends Client {
    constructor(options) {
        super(options);
        this.utils = {
            mention: mentionParsing
        };
        this.deletedChannels = new WeakSet();
        this.recent = new Set();
        this.config = require("../config.json");
        this.leveling = require("../util/LevelingUtil.js");
    }
};
