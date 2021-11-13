const { canModifyQueue, STAY_TIME } = require("../../../util/musicutil");
const { MessageEmbed } = require('discord.js');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: 'there is nothing to pause since i\'m not playing anything :grimacing:' }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });

    if (queue.playing) {
        queue.pause();
        if (queue.textChannel.id !== interaction.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} paused the current song ⏸️` }] });
        if (queue.textChannel.deleted) queue.textChannel = interaction.channel;
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `you paused the current song ⏸️` }] });
    } else {
        return interaction.reply({ content: 'the music is already paused :thinking:', ephemeral: true });
    };
};