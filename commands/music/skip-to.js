const { canModifyQueue } = require("../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    if (!args.length || isNaN(args[0])) return message.channel.send({ embed: { color: "f3f3f3", description: `❌ wrong usage! use \`${prefix}help skip-to\` to learn more :wink:` } });
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embed: { color: "f3f3f3", description: `:x: there isn't any ongoing music queue` } });
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` } });
    if (args[0] > queue.songs.length) return message.channel.send({ embed: { color: "f3f3f3", description: `invaild queue position :pensive: the queue is only **${queue.songs.length}** songs long!` } });
    const playerListening = queue.channel.members.array();
    let listening = playerListening.filter(x => !x.user.bot).length;
    if (listening >= 2 && queue.nowPlaying.requestedby.id !== message.author.id) {
        let leftMembers = listening - 1;
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
        collector.on('end', async() => {
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
    await queue.player.stop();
    const number = args[0] - 1;
    if (queue.textChannel.id !== message.channel.id) message.channel.send({ embed: { color: "f3f3f3", description: `⏭ you skipped ${number} songs!` } })
    return queue.textChannel.send({ embed: { color: "f3f3f3", description: `${message.author} skipped ${number} songs ⏭` } })
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

    channelPerms: ["EMBED_LINKS"]
}