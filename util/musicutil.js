exports.canModifyQueue = (member) => {
  const { channelID } = member.voice;
  const botChannel = member.guild.voice.channelID;

  if (channelID !== botChannel) {
    return;
  }

  return true;
};

exports.YOUTUBE_API_KEY = process.env.youtubekey;
exports.SOUNDCLOUD_CLIENT_ID = process.env.soundcloudkey;
exports.MAX_PLAYLIST_SIZE = "30"
exports.PRUNING = false;
exports.STAY_TIME = "30"
exports.DEFAULT_VOLUME = "100";