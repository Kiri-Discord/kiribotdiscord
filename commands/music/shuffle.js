const { canModifyQueue } = require("../../util/musicutil");
const { shuffle } = require('../../util/util');

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to shuffle since i\'m not playing anything :grimacing:').catch(console.error);
    if (!canModifyQueue(message.member)) return message.reply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);
    const songs = queue.songs;
    const shuffled = shuffle(songs);
    queue.songs = shuffled;
    client.queue.set(message.guild.id, queue);
    queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} has shuffled the queue 🔀`}});
    if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `${message.author}, you has shuffled the queue 🔀`}}).catch(console.error);
}

exports.help = {
  name: "shuffle",
  description: "shuffle the music queue",
  usage: "shuffle",
  example: "shuffle"
}

exports.conf = {
  aliases: ["sh"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}