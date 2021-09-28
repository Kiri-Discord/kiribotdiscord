const { youtubekey, soundcloudkey } = require('../config.json');
exports.canModifyQueue = (member) => {
    const { channelId } = member.voice;
    const botChannel = member.guild.me.voice.channelId;
    if (channelId !== botChannel) {
        return;
    };
    return true;
};

exports.YOUTUBE_API_KEY = youtubekey;
exports.SOUNDCLOUD_CLIENT_ID = soundcloudkey;
exports.MAX_PLAYLIST_SIZE = "100"
exports.PRUNING = false;
exports.STAY_TIME = "30";
exports.DEFAULT_VOLUME = "100";