const {Client, Collection} = require("c:/Users/HP/Documents/GitHub/sefybotdiscord/events/node_modules/discord.js.js");

module.exports = class TutorialBot extends Client {
  constructor(options) {
    super(options)
    
    this.commands = new Collection(); // This will store your commands.
    this.cooldowns = new Collection(); // This will store your commands with cooldowns.
    this.aliases = new Collection(); // This will store your alternative commands. Example: /server -> /serverinfo, /guild, /guildinfo
    this.config = require('f:/bot-tutorial-season-2-master/bot-tutorial-season-2-master/config.json');
    this.recent = new Set();
  }
}
