const { canModifyQueue } = require("../../../util/musicutil");
const { MessageCollector } = require('discord.js');

exports.run = async(client, interaction) => {
    const index = interaction.options.getInteger('index');
    const queue = client.queue.get(interaction.guild.id);

    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (!queue.songs.length) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!queue.nowPlaying) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (index > queue.songs.length) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `invaild queue position :pensive: the queue is only **${queue.songs.length}** songs long!` }], ephemeral: true });


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
                if (!queue.songs.length) return interaction.channel.send({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }], ephemeral: true });
                const number = index - 1;
                interaction.channel.send({ embeds: [{ color: "#bee7f7", description: `you skipped ${number} songs! ⏭` }] })
                return skip(queue, interaction, index, sentMessage);
            }
            const sent = await interaction.channel.send(`**${vote}** member voted to skip ⏭ only **${leftMembers - vote}** member left!`);
            sentMessage.push(sent);
        });
        collector.on('end', async() => {
            if (vote !== leftMembers) return interaction.channel.send(`not enough people to skip song!`);
        });
    } else {
        const number = index - 1;
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `⏭ you skipped ${number} songs!` }] })
        return skip(queue, interaction, index);
    };
};

async function skip(queue, interaction, index, sentMessage) {
    queue.playing = true;
    if (queue.loop) {
        for (let i = 0; i < index - 1; i++) {
            queue.songs.push(queue.songs.shift());
        }
    } else {
        queue.songs = queue.songs.slice(index - 1);
    };
    if (queue.repeat) queue.nowPlaying = undefined;
    queue.skip();
    const number = index - 1;
    if (queue.textChannel.id !== interaction.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} skipped ${number} songs ⏭` }] });
    if (queue.textChannel.deleted) queue.textChannel = interaction.channel;
    if (sentMessage) {
        for (let msg of sentMessage) {
            msg.delete();
        };
    };
};