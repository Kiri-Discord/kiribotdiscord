const { canModifyQueue } = require("../../util/musicutil");

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('i can\'t change the volume since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);
    if (!args[0]) return message.inlineReply({embed: {color: "f3f3f3", description: `the current volume is ${queue.volume} 🔊`}});
    if (isNaN(args[0])) return message.inlineReply({embed: {color: "f3f3f3", description: `the amount of volume must be a number ❌`}});
    if (Number(args[0]) > 100 || Number(args[0]) < 0) return message.inlineReply({embed: {color: "f3f3f3", description: `invaild number :pensive: the amount of volume must not lower than zero, and must not higher than 100% ❌`}});
    queue.volume = args[0];
    queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `volume set to ${args[0]} 🔊`}});
    return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} set the volume to ${args[0]} 🔊`}});
}


exports.help = {
  name: "volume",
  description: "Change the volume of the current playing song",
  usage: "volume `<number>`",
  example: ["volume `40`", "volume 30"]
}

exports.conf = {
  aliases: ["vol"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  channelPerms: ["EMBED_LINKS"]
}