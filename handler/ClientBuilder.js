const express = require('express');
const { Client, Collection } = require("discord.js");
const PokemonStore = require('../features/pokemon/pokemonstore');
const RedisClient = require('../util/redis');
const VerifyTimer = require('../features/redis/verify');
const app = express();

module.exports = class sefy extends Client {
  constructor(options) {
    super(options)
    this.vote = require('../model/vote');
    this.globalStorage = require('../model/global');
    this.gameStorage = require('../model/game');
    this.webapp = app;
    this.queue = new Map();
    this.commands = new Collection();
    this.redis = RedisClient ? RedisClient.db : null;
    this.cooldowns = new Collection();
    this.helps = new Collection();
    this.customEmojis = new Collection;
    this.allNameCmds = [];
    this.allNameFeatures = [];
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
    this.voicequeue = new Collection();
    this.pokemon = new PokemonStore();
    this.verifytimers = new VerifyTimer(this);
  }
}
