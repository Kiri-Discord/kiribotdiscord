const { canModifyQueue } = require("../../util/musicutil");

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to loop since i\'m not playing anything :grimacing:').catch(console.error);
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);
    queue.loop = !queue.loop;
    if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `loop is turned ${queue.loop ? "on" : "off"} for the current song 🔁`}})
    queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} turn loop ${queue.loop ? "on" : "off"} for the current song 🔁`}}).catch(console.error);
}
exports.help = {
  name: "loop",
  description: "Loop the current playing song",
  usage: "loop",
  example: "loop"
}

exports.conf = {
  aliases: ["lp"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  channelPerms: ["EMBED_LINKS"]
}