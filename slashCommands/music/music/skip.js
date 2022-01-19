const { canModifyQueue } = require("../../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!queue.nowPlaying) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });

    const playerListening = [...queue.channel.members.values()];
    let listening = playerListening.filter(x => !x.user.bot).length;
    if (listening >= 2 && queue.nowPlaying.requestedby.id !== interaction.user.id) {
        let leftMembers = listening - 1;
        let vote = 0;
        let voted = [];
        const sentMessage = [];
        const firstSent = await interaction.reply({ content: `there are **${leftMembers}** people listening as well! to skip, type \`skip\` ⏭`, fetchReply: true });
        sentMessage.push(firstSent);
        const collector = new MessageCollector(interaction.channel, {
            filter: msg => {
                if (msg.content.toLowerCase() === 'skip' && msg.author.id !== interaction.user.id && !msg.author.bot && !voted.includes(msg.author.id) && canModifyQueue(msg.member)) return true;
            },
            time: 15000
        });
        collector.on('collect', async msg => {
            voted.push(msg.author.id);
            vote = vote + 1;
            if (vote === leftMembers) {
                collector.stop();
                interaction.channel.send({ embeds: [{ color: "#bee7f7", description: `skipped to the next track in the queue ⏭` }] });
                return skip(queue, interaction, sentMessage, client);
            };
            const sent = await interaction.channel.send(`**${vote}** member voted to skip the current song ⏭ only **${leftMembers - vote}** member left!`);
            sentMessage.push(sent);
        });
        collector.on('end', async() => {
            if (vote !== leftMembers) return interaction.channel.send(`not enough people to skip song!`);
        });
    } else {
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `skipped to the next track in the queue ⏭` }] });
        return skip(queue, interaction, null, client);
    };
};
async function skip(queue, interaction, sentMessage, client) {
    queue.playing = true;
    if (queue.repeat) queue.nowPlaying = undefined;
    queue.skip();
    if (queue.textChannel.id !== interaction.channel.id && !client.deletedChannels.has(queue.textChannel)) return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} skipped to the next track in the queue ⏭` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = interaction.channel;
    if (sentMessage) {
        for (let msg of sentMessage) {
            msg.delete();
        };
    };
};