const { canModifyQueue } = require("../../util/musicutil");

const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply('there is nothing to resume since there isn\'t anything in the queue :grimacing:').catch(console.error);
    if (!canModifyQueue(message.member)) return message.reply(`you are not in the voice channel where i\'m *playing* music! join ${queue.channel} to listen :wink:`);

    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const prefix = setting.prefix;

    if (!args.length) return message.channel.send({embed: {color: "f3f3f3", description: `you must to tell me what song you want to remove! use \`${prefix}help remove\` to learn more :wink:`}});

    const arguments = args.join("");
    const songs = arguments.split(",").map((arg) => parseInt(arg));
    let removed = [];
    
    if (pattern.test(arguments)) {
      queue.songs = queue.songs.filter((item, index) => {
        if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
        else return true;
      });
      if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `❌ you removed **${removed.map((song) => song.title).join("\n")}** from the queue`}});
      return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} removed **${removed.map((song) => song.title).join("\n")}** from the queue ❌`}})
    } else if (!isNaN(args[0]) && args[0] >= 1 && args[0] <= queue.songs.length) {
      if (queue.textChannel.id !== message.channel.id) message.channel.send({embed: {color: "f3f3f3", description: `❌ you removed **${queue.songs.splice(args[0] - 1, 1)[0].title}** from the queue ❌`}});
      return queue.textChannel.send({embed: {color: "f3f3f3", description: `${message.author} removed **${queue.songs.splice(args[0] - 1, 1)[0].title}** from the queue ❌`}});
    } else {
        return message.channel.send({embed: {color: "f3f3f3", description: `wrong usage! use \`${prefix}help remove\` to learn more :wink:`}});
    }

}

exports.help = {
  name: "remove",
  description: "Remove a song from the queue",
  usage: "remove `<postion of track>`",
  example: ["remove `1`", "remove `4, 2, 6`"]
}

exports.conf = {
  aliases: ["clear", "rm"],
  cooldown: 4,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}