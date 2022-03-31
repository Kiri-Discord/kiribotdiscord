const { canModifyQueue } = require("../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    if (!args.length || isNaN(args[0])) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `to what song would you want to skip? (for example ${prefix}skip-to 5)` }] });
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (!queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!queue.nowPlaying) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    
    if (args[0] > queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `invaild queue position :pensive: the queue is only **${queue.songs.length}** songs long!` }] });
    const playerListening = [...queue.channel.members.values()];
    let listening = playerListening.filter(x => !x.user.bot).length;
    if (listening >= 2 && queue.nowPlaying.requestedby.id !== message.author.id) {
        let leftMembers = listening - 1;
        let vote = 0;
        let voted = [];
        const sentMessage = [];
        const firstSent = await message.channel.send(`there are **${leftMembers}** people listening as well! to skip, type \`skip\` ⏭`);
        sentMessage.push(firstSent);
        const collector = new MessageCollector(message.channel, {
            filter: msg => {
                if (msg.content.toLowerCase() === 'skip' && msg.author.id !== message.author.id && !msg.author.bot && !voted.includes(msg.author.id) && canModifyQueue(msg.member)) return true;
            },
            time: 15000
        });
        collector.on('collect', async msg => {
            voted.push(msg.author.id);
            vote = vote + 1;
            if (vote === leftMembers) {
                collector.stop();
                return skip(queue, message, args, sentMessage, client);
            }
            const sent = await message.channel.send(`**${vote}** member voted to skip ⏭ only **${leftMembers - vote}** member left!`);
            sentMessage.push(sent);
        });
        collector.on('end', async() => {
            if (vote !== leftMembers) return message.channel.send(`not enough people to skip song!`);
        });
    } else {
        return skip(queue, message, args, null, client);
    }
};

async function skip(queue, message, args, sentMessage, client) {
    if (!queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }] });
    queue.playing = true;
    if (queue.loop) {
        for (let i = 0; i < args[0] - 1; i++) {
            queue.songs.push(queue.songs.shift());
        }
    } else {
        queue.songs = queue.songs.slice(args[0] - 1);
    };
    if (queue.repeat) queue.nowPlaying = undefined;
    queue.skip();
    const number = args[0] - 1;
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} skipped ${number} songs ⏭` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `you skipped ${number} songs! ⏭` }] })
    if (sentMessage) {
        for (let msg of sentMessage) {
            msg.delete();
        };
    };
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