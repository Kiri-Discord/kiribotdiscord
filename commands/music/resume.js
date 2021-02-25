const { canModifyQueue } = require("../../util/musicutil");

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply('there is nothing to resume since there isn\'t anything in the queue :grimacing:').catch(console.error);
    if (!canModifyQueue(message.member)) return message.reply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);

    
    if (!queue.playing) {
        queue.playing = true;
        queue.connection.dispatcher.resume();
        if (queue.textChannel.id !== message.channel.id) message.channel.send('▶️ resuming...')
        queue.textChannel.send(({embed: {color: "f3f3f3", description: `${message.author} resumed the current song ▶️`}}))
    } else {
        return message.channel.send('i am already playing lmao\n||*there might be a problem when i tried to resume the song, sorry*||')
    }
  
}
exports.help = {
  name: "resume",
  description: "Resume the current playing song",
  usage: "resume",
  example: "resume"
}

exports.conf = {
  aliases: ["re"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}