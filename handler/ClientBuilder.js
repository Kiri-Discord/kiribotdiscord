const express = require('express');
const { Client, Collection } = require("discord.js");
const { readdir } = require('fs');
const PokemonStore = require('../features/pokemon/pokemonstore');
const RedisClient = require('../util/redis');
const VerifyTimer = require('../features/redis/verify');
const app = express();

module.exports = class sefy extends Client {
  constructor(options) {
    super(options)
    this.webapp = app;
    this.queue = new Map();
    this.commands = new Collection();
    this.redis = RedisClient ? RedisClient.db : null;
    this.cooldowns = new Collection();
    this.helps = new Collection();
    this.customEmojis = new Collection;
    this.allNameCmds = [];
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
        /** 
     * 
     * @type {Array<string>}
     */
    this.topics = [];
    
    
  }
    /**
   * 
   * @param {string} path 
   */
  loadTopics(path) {
    readdir(path, (err, files) => {
      if (err) console.error(err);
      files = files.filter(f => f.split('.').pop() === 'yml');
      if (files.length === 0) return console.log('No topics found');
      console.log(`${files.length} topic(s) found...`);
      files.forEach(f => {
        const topic = f.substring(0, f.indexOf('.'));
        this.topics.push(topic);
        console.log(`Loading topic: ${topic}`);
      });
    });
    return this;
  }
}
