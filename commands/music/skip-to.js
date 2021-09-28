const { canModifyQueue } = require("../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    if (!args.length || isNaN(args[0])) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ wrong usage! use \`${prefix}help skip-to\` to learn more :wink:` }] });
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (!queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (args[0] > queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `invaild queue position :pensive: the queue is only **${queue.songs.length}** songs long!` }] });
    const playerListening = [...queue.channel.members.values()];
    let listening = playerListening.filter(x => !x.user.bot).length;
    if (listening >= 2 && queue.nowPlaying.requestedby.id !== message.author.id) {
        let leftMembers = listening - 1;
        let vote = 0;
        let voted = [];
        await message.channel.send(`there are **${leftMembers}** people listening as well! to skip, type \`skip\` ⏭`);
        const collector = new MessageCollector(message.channel, {
            filter: msg => {
                if (msg.content.toLowerCase() === 'skip' && msg.author.id !== message.author.id && !msg.author.bot && !voted.includes(msg.author.id)) return true;
            },
            time: 15000
        });
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
        for (let i = 0; i < args[0] - 1; i++) {
            queue.songs.push(queue.songs.shift());
        }
    } else {
        queue.songs = queue.songs.slice(args[0] - 1);
    };
    queue.nowPlaying = undefined;
    await queue.player.emit('skip');
    const number = args[0] - 1;
    if (queue.textChannel.id !== message.channel.id) message.channel.send({ embeds: [{ color: "#bee7f7", description: `⏭ you skipped ${number} songs!` }] })
    return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} skipped ${number} songs ⏭` }] })
};

exports.help = {
    name: "skip-to",
    description: "skip to the selected song in the queue",
    usage: ["skip-to"],
    example: ["skip-to"]
}

exports.conf = {
    aliases: ["st", "skipto"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}