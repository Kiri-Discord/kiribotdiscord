exports.canModifyQueue = (member) => {
    const { channelId } = member.voice;
    const botChannel = member.guild.me.voice.channelId;
    if (channelId !== botChannel) {
        return;
    };
    return true;
};

exports.YOUTUBE_API_KEY = process.env.youtubekey;
exports.SOUNDCLOUD_CLIENT_ID = process.env.soundcloudkey;
exports.MAX_PLAYLIST_SIZE = "100"
exports.PRUNING = false;
exports.STAY_TIME = "1200";
exports.DEFAULT_VOLUME = "100";