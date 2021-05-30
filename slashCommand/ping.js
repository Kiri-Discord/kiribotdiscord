const { SlashCommand } = require('slash-create');
const client = require('../main');

module.exports = class PingCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'ping',
      description: 'very self-explanatory'
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    const sip = client.customEmojis.get('sip');
    return `pong! took me ${client.ws.ping}ms ${sip}`
  }
}