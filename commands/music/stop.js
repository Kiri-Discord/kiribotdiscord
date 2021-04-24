const { canModifyQueue } = require("../../util/musicutil");
exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to stop since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);
    queue.songs = [];
    queue.connection.dispatcher.end();
    if (queue.textChannel.id !== message.channel.id) message.channel.send('🛑 stopping...')
    return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} stopped the music 🛑`}});
}

exports.help = {
  name: "stop",
  description: "Stop the music and clear the queue :pensive:",
  usage: "stop",
  example: "stop"
}

exports.conf = {
  aliases: ["end"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  channelPerms: ["EMBED_LINKS"]
}