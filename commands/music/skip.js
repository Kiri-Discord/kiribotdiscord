const { canModifyQueue } = require("../../util/musicutil");
exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply('there is nothing to skip since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.reply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);
    queue.playing = true;
    await queue.connection.dispatcher.end();
    if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `${message.author}, you skipped to the next track in the queue ⏭`}})
    return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} skipped to the next track in the queue ⏭`}});
}
exports.help = {
  name: "skip",
  description: "Skip the currently playing song",
  usage: "skip",
  example: "skip"
}

exports.conf = {
  aliases: ["s"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}