const {Client, Collection, Guild, GuildMember} = require("discord.js");
const { readdir, readdirSync } = require('fs');
const { join, resolve } = require('path');

module.exports = class sefy extends Client {
  constructor(options) {
    super(options)
    this.commands = new Collection(); 
    this.cooldowns = new Collection(); // This will store your commands with cooldowns.
    this.aliases = new Collection(); // This will store your alternative commands. Example: /server -> /serverinfo, /guild, /guildinfo
    this.config = require('../config.json');
    this.recent = new Set();
    this.dbguilds = require('../model/guild');
    this.queue = new Map();
        /** 
     * Array of trivia topics
     * @type {Array<string>}
     */
    this.topics = [];
    
    
  }
    /**
   * Loads all available trivia topics
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
