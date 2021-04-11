const { canModifyQueue } = require("../../util/musicutil");

exports.run = async (client, message, args) => {
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    if (!args.length || isNaN(args[0])) return message.channel.send({embed: {color: "f3f3f3", description: `❌ wrong usage! use \`${setting.prefix}help skip-to\` to learn more :wink:`}});
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to skip since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);
    if (args[0] > queue.songs.length) return message.channel.send({embed: {color: "f3f3f3", description: `invaild queue position :pensive: the queue is only **${queue.songs.length}** songs long!`}});
    queue.playing = true;
    if (queue.loop) {
        for (let i = 0; i < args[0] - 2; i++) {
          queue.songs.push(queue.songs.shift());
        }
    } else {
        queue.songs = queue.songs.slice(args[0] - 2);
    }

    await queue.connection.dispatcher.end();
    const number = args[0] - 1;
    if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `⏭ you skipped ${number} songs!`}})
    return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} skipped ${number} songs ⏭`}})
  
}
exports.help = {
  name: "skip-to",
  description: "Skip to the selected song in the queue",
  usage: "skip-to",
  example: "skip-to"
}

exports.conf = {
  aliases: ["st", "skipto"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}