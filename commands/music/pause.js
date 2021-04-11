const { canModifyQueue } = require("../../util/musicutil");


exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to pause since i\'m not playing anything :grimacing:').catch(console.error);
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);


    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      queue.textChannel.send(({embed: {color: "f3f3f3", description: `${message.author} paused the current song ⏸️`}}))
      if (queue.textChannel.id !== message.channel.id) message.channel.send('⏸️ pausing...')
    } else {
      return message.channel.send('the music is already paused :thinking:')
    }
}
exports.help = {
  name: "pause",
  description: "Pause the current playing song",
  usage: "pause",
  example: "pause"
}

exports.conf = {
  aliases: ["p"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}