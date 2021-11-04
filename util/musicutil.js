const { youtubekey, soundcloudkey } = require('../config.json');
const request = require('node-superfetch');

exports.canModifyQueue = (member) => {
    const { channelId } = member.voice;
    const botChannel = member.guild.me.voice.channelId;
    if (channelId !== botChannel) {
        return;
    };
    return true;
};
exports.fetchInfo = async(client, query, search, id) => {
    const nodes = client.lavacordManager.idealNodes;
    const node = id ? nodes.filter(x => x.id !== id)[0] : nodes[0];
    const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    const searchType = search || 'ytsearch';

    const { body } = await request
        .get(`http://${node.host}:${node.port}/loadtracks`)
        .set({ Authorization: node.password })
        .query({
            identifier: urlRegex.test(query) ? query : `${searchType}:${query}`,
        });
    return body.tracks;
}

exports.YOUTUBE_API_KEY = youtubekey;
exports.SOUNDCLOUD_CLIENT_ID = soundcloudkey;
exports.MAX_PLAYLIST_SIZE = "100"
exports.PRUNING = false;
exports.STAY_TIME = "600";
exports.DEFAULT_VOLUME = "100";