const { canModifyQueue } = require("../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async (client, message, args, prefix) => {
    if (!args.length || isNaN(args[0])) return message.channel.send({embed: {color: "f3f3f3", description: `❌ wrong usage! use \`${prefix}help skip-to\` to learn more :wink:`}});
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to skip since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);
    if (args[0] > queue.songs.length) return message.channel.send({embed: {color: "f3f3f3", description: `invaild queue position :pensive: the queue is only **${queue.songs.length}** songs long!`}});
    if (queue.channel.members.size > 2 && queue.songs[0].requestedby.id !== message.author.id) {
      let listening = queue.channel.members.size;
      let leftMembers = listening - 2;
      let vote = 0;
      let voted = [];
      await message.channel.send(`there are **${leftMembers}** people listening as well! to skip, type \`skip\` ⏭`);
      const collector = new MessageCollector(message.channel, msg => {
        if (msg.content.toLowerCase() === 'skip' && msg.author.id !== message.author.id && !msg.author.bot && !voted.includes(msg.author.id)) return true;
      }, { time: 15000 });
      collector.on('collect', async msg => {
        voted.push(msg.author.id);
        vote = vote + 1;
        if (vote === leftMembers) {
          await collector.stop();
          return skip(queue, message, args);
        }
        message.channel.send(`**${vote}** member voted to skip ⏭ only **${leftMembers - vote}** member left!`)
      });
      collector.on('end', async () => {
        if (vote !== leftMembers) return message.channel.send(`not enough people to skip song!`);
      });
    } else {
      return skip(queue, message, args);
    }
};

async function skip(queue, message, args) {
  queue.playing = true;
  if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
  } else {
      queue.songs = queue.songs.slice(args[0] - 2);
  };
  await queue.connection.dispatcher.end();
  const number = args[0] - 1;
  if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `⏭ you skipped ${number} songs!`}})
  return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} skipped ${number} songs ⏭`}})
};

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
  channelPerms: ["EMBED_LINKS"]
}