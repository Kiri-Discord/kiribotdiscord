const {Client, Collection, GuildMember} = require("discord.js");

module.exports = class sefy extends Client {
  constructor(options) {
    super(options)
    
    
    this.commands = new Collection(); 
    this.cooldowns = new Collection(); // This will store your commands with cooldowns.
    this.aliases = new Collection(); // This will store your alternative commands. Example: /server -> /serverinfo, /guild, /guildinfo
    this.config = require('../config.json');
    this.recent = new Set();
    this.guildlist = require('../model/guild')
  }
}
