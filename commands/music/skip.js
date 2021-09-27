const { canModifyQueue } = require("../../util/musicutil");
const { reactIfAble } = require("../../util/util");
const { MessageCollector } = require('discord.js');

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
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
        const sentMessage = [];
        collector.on('collect', async msg => {
            voted.push(msg.author.id);
            vote = vote + 1;
            if (vote === leftMembers) {
                collector.stop();
                return skip(queue, message, client, sentMessage);
            };
            const sent = await message.channel.send(`**${vote}** member voted to skip the current song ⏭ only **${leftMembers - vote}** member left!`);
            sentMessage.push(sent);
        });
        collector.on('end', async() => {
            if (vote !== leftMembers) return message.channel.send(`not enough people to skip song!`);
        });
    } else {
        return skip(queue, message, client);
    };
};
async function skip(queue, message, client, sentMessage) {
    queue.playing = true;
    queue.nowPlaying = undefined;
    queue.player.stop();
    reactIfAble(message, client.user, '👌');
    if (sentMessage) {
        for (let msg of sentMessage) {
            msg.delete();
        };
    };
};
exports.help = {
    name: "skip",
    description: "skip the currently playing song",
    usage: ["skip"],
    example: ["skip"]
};

exports.conf = {
    aliases: ["s"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};