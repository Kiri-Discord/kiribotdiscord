const { canModifyQueue } = require("../../util/musicutil");
exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to skip since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);
    queue.playing = true;
    await queue.connection.dispatcher.end();
    if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `${message.author}, you skipped to the next track in the queue ⏭`}})
    return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} skipped to the next track in the queue ⏭`}});
}
exports.help = {
  name: "force-skip",
  description: "skip the currently playing song forcefully",
  usage: "force-skip",
  example: "force-skip"
}

exports.conf = {
  aliases: ["fs", "forceskip"],
  cooldown: 3,
  guildOnly: true,
  userPerms: ["MANAGE_GUILD"],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}