const { SlashCommand } = require('slash-create');

module.exports = class PongCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'pong',
      description: "DON'T DO THIS"
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    return 'dont hit me in the face lmao'
  }
}