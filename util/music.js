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

            if (!client.queue.size) return logger.log('info', `[LAVALINK] Node ${node.id} disconnected.`);
            const queues = [...client.queue.values()].filter(queue => queue.player.node.id === node.id);
            if (!queues.length) return logger.log('info', `[LAVALINK] Node ${node.id} disconnected.`);
            let succeded = 0;
            for (const queue of queues) {
                const { nowPlaying } = queue;
                let avaliableNodes;
                if (queue.songs.length) {
                    avaliableNodes = (queue.songs.some(song => song.info.sourceName === 'soundcloud') || nowPlaying.info.sourceName === 'soundcloud') ?
                    client.lavacordManager.idealNodes.filter(no => no.ws && no.id !== 'yt' && no.id !== node.id) :
                    client.lavacordManager.idealNodes.filter(no => no.ws && no.id !== node.id);
                } else {
                    avaliableNodes = nowPlaying.info.sourceName === 'soundcloud' ?
                    client.lavacordManager.idealNodes.filter(no => no.ws && no.id !== 'yt' && no.id !== node.id) :
                    client.lavacordManager.idealNodes.filter(no => no.ws && no.id !== node.id);
                }

                if (!avaliableNodes.length) {
                    queue.stop('errorNode');
                    const cry = client.customEmojis.get('cry');
                    return queue.textChannel.send({ embeds: [{ description: `Discord had terminated my voice connection! i had cleared the queue ${cry}` }] });
                } else {
                    succeded++;
                    queue.textChannel.send({ embeds: [{ description: `there was an error while playing the music! i am attempting to reconnect...` }] });

                    if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.pause(Date.now());
                    const timestamp = parseInt(queue.player.state.position);
                    const voiceState = queue.player.voiceUpdateState;

                    const targetNode = avaliableNodes[Math.floor(Math.random() * avaliableNodes.length)];

                    client.lavacordManager.players.delete(queue.guildId);

                    const state = await queue.initVc(targetNode, voiceState);
                    if (state === 'TRIED_TO_JOIN_WITH_NODES') {
                        return queue.textChannel.send({ embeds: [{ color: "RED", description: `i can't join your voice channel somehow. probably Discord has something to do with it or my music nodes are down :pensive:` }] });
                    } else if (state === 'CANT_VERIFY') {
                        const deadEmoji = client.customEmojis.get('dead');
                        return queue.textChannel.send({ embeds: [{ description: `i can't verify if i have joined your channel or not. probably Discord has something to do with it ${deadEmoji} you can create a new queue instead if song won't play.` }] });
                    };

                    queue.textChannel.send({ embeds: [{ description: `i have reconnected to your voice channel! :smile:` }] });

                    queue.player.play(nowPlaying.track, {
                        volume: queue.volume || 100,
                        startTime: timestamp,
                        pause: !queue.playing
                    });
                };
            };
            return logger.log('info', `[LAVALINK] Node ${node.id} disconnected. Migrated ${succeded} queue out of ${queues.length} queue affected!`);
        });
        return true;
    }
};