const express = require('express');
const { Client, Collection } = require("discord.js");
const PokemonStore = require('../features/pokemon/pokemonstore');
const VerifyTimer = require('../features/redis/verify');
const { Manager } = require('@lavacord/discord.js');
const app = express();

module.exports = class kiri extends Client {
    constructor(options) {
        super(options)
        this.nodes = require('../lavalinkNodes.json');
        this.vote = require('../model/vote');
        this.globalStorage = require('../model/global');
        this.gameStorage = require('../model/game');
        this.lavacordManager = new Manager(this, this.nodes);
        this.webapp = app;
        this.queue = new Map();
        this.commands = new Collection();
        this.cooldowns = require('../model/cooldown');
        this.inventory = require('../model/inventory');
        this.garden = require('../model/garden');
        this.helps = new Collection();
        this.customEmojis = new Collection();
        this.allNameCmds = [];
        this.allNameFeatures = [];
        this.allNameFeaturesSlash = [];
        this.guildsStorage = new Collection();
        this.aliases = new Collection();
        this.config = require('../config.json');
        this.recent = new Set();
        this.money = require('../model/currency');
        this.love = require('../model/love');
        this.dbguilds = require('../model/guild');
        this.leveling = require("../util/LevelingUtil.js");
        this.dbleveling = require("../model/leveling")
        this.dbverify = require("../model/verify")
        this.games = new Collection();
        this.pokemon = new PokemonStore();
        this.verifytimers = new VerifyTimer(this);
    };
}