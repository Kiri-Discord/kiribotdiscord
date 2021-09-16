const Manager = require('../features/music/lavacord');
const nodes = require('../lavalinkNodes.json');

module.exports = {
    init: async(client) => {
        client.lavacordManager = new Manager(client, nodes, {
            user: client.user.id,
            shards: client.options.shardCount || 1
        });
        try {
            const success = await client.lavacordManager.connect();
            logger.log('info', `[LAVALINK] Connected to ${success.filter(ws => ws != null).length} lavalink node(s) out of ${client.nodes.length} total node(s).`);
            return true;
        } catch (err) {
            logger.log('error', `Error connecting to lavalink.`, err);
            process.exit(1);
        };
    }
};