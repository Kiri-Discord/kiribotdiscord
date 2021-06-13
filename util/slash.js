const { GatewayServer, SlashCreator } = require('slash-create');
const path = require('path');

module.exports = {
    init: (client) => {
        const creator = new SlashCreator({
            applicationID: client.user.id,
            publicKey: process.env.publicKey,
            token: process.env.token
          });
        creator
        .withServer(
            new GatewayServer(
                (handler) => client.ws.on('INTERACTION_CREATE', handler)
            )
        )
        .registerCommandsIn(path.join(__dirname, '..', 'slashCommand'))
        .syncCommands()
        console.log('[DISCORD] Loaded slash command');
    }
}