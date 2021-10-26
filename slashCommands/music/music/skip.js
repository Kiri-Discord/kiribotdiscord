const { canModifyQueue } = require("../../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });

    interaction.reply({ content: 'begin skipping...', ephemeral: true });

    const playerListening = [...queue.channel.members.values()];
    let listening = playerListening.filter(x => !x.user.bot).length;
    if (listening >= 2 && queue.nowPlaying.requestedby.id !== interaction.user.id) {
        let leftMembers = listening - 1;
        let vote = 0;
        let voted = [];
        const sentMessage = [];
        const firstSent = await interaction.channel.send(`there are **${leftMembers}** people listening as well! to skip, type \`skip\` ⏭`);
        sentMessage.push(firstSent);
        const collector = new MessageCollector(interaction.channel, {
            filter: msg => {
                if (msg.content.toLowerCase() === 'skip' && msg.author.id !== interaction.user.id && !msg.author.bot && !voted.includes(msg.author.id)) return true;
            },
            time: 15000
        });
        collector.on('collect', async msg => {
            voted.push(msg.author.id);
            vote = vote + 1;
            if (vote === leftMembers) {
                collector.stop();
                return skip(queue, interaction, sentMessage);
            };
            const sent = await interaction.channel.send(`**${vote}** member voted to skip the current song ⏭ only **${leftMembers - vote}** member left!`);
            sentMessage.push(sent);
        });
        collector.on('end', async() => {
            if (vote !== leftMembers) return interaction.channel.send(`not enough people to skip song!`);
        });
    } else {
        return skip(queue, interaction);
    };
};
async function skip(queue, interaction, sentMessage) {
    queue.playing = true;
    if (queue.repeat) queue.nowPlaying = undefined;
    queue.skip();
    interaction.reply({ embeds: [{ color: "#bee7f7", description: `skipped to the next track in the queue ⏭` }] });
    if (queue.textChannel.id !== interaction.channel.id) return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} skipped to the next track in the queue ⏭` }] });
    if (sentMessage) {
        for (let msg of sentMessage) {
            msg.delete();
        };
    };
};