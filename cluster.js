const { Client } = require('discord-cross-hosting');
const Cluster = require('discord-hybrid-sharding');

const client = new Client({
    agent: 'bot',
    host: 'localhost',
    port: 4444,
    authToken: 'coconut',
    rollingRestarts: false, // Enable, when bot should respawn when cluster list changes.
});
client.on('debug', console.log);
client.connect();

const manager = new Cluster.Manager(`${__dirname}/main.js`, { totalClusters: 1, totalShards: 1 });
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.on('debug', console.log);

client.listen(manager);
client
    .requestShardData()
    .then(e => {
        if (!e) return;
        if (!e.shardList) return;
        manager.totalShards = e.totalShards;
        manager.totalClusters = e.shardList.length;
        manager.shardList = e.shardList;
        manager.clusterList = e.clusterList;
        manager.spawn({ timeout: -1 });
    })
    .catch(e => console.log(e));