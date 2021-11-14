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
            logger.log('info', `[LAVALINK] Connected to ${success.filter(ws => ws != null).length} lavalink node(s) out of ${nodes.length} total node(s).`);

        } catch (err) {
            logger.log('error', `Error connecting to lavalink.`, err);
            process.exit(1);
        };
        client.lavacordManager.on('disconnect', async(event, node) => {
            logger.log('info', `[LAVALINK] Node ${node.id} disconnected.`);
            if (!client.queue.size) return;
            const queues = [...client.queue.values()].filter(queue => queue.player.node.id === node.id);
            if (!queues.length) return;
            const avaliableNodes = client.lavacordManager.idealNodes.filter(node => node.ws);
            for (const queue of queues) {
                if (!avaliableNodes.length) {
                    if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
                    client.lavacordManager.leave(queue.guildId);
                    return queue.textChannel.send({ embeds: [{ description: `there was an error while playing the music! i had left the voice channel :pensive:` }] });
                } else {
                    const targetNode = avaliableNodes[Math.floor(Math.random() * avaliableNodes.length)];
                    await client.lavacordManager.switch(queue.player, targetNode);
                }
            };
        });
        return true;

    }
};