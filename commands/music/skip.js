const { canModifyQueue } = require("../../util/musicutil");
const { MessageCollector } = require('discord.js');
exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply('there is nothing to skip since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.reply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);
    let collector;
    if (queue.channel.members.size > 2) {
      let leftMembers = queue.channel.members.size - 2;
      let vote = 0;
      await message.channel.send(`there are **${queue.channel.members.size - 2}** people listening as well! to skip, type \`skip\` ⏭`);
      collector = new MessageCollector(message.channel, msg => {
        if (msg.content.toLowerCase() === 'skip' && msg.author.id !== message.author.id) return true;
      }, { time: 15000 });
      collector.on('collect', async msg => {
        if (vote = leftMembers) {
          await collector.stop();
          return skip(queue, message);
        }
        vote = vote + 1;
        message.channel.send(`**${vote}** member voted to skip the current song ⏭ only **${leftMembers - vote}** member left!`)
      });
      collector.on('end', async () => {
        if (vote !== leftMembers) return message.channel.send(`not enough people to skip song!`);
      });
    } else {
      return skip(queue, message);
    }
}
async function skip(queue, message) {
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