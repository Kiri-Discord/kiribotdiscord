const { canModifyQueue, STAY_TIME } = require("../../../util/musicutil");
const { MessageEmbed } = require('discord.js');

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: 'there is nothing to pause since i\'m not playing anything :grimacing:' }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });

    if (queue.playing) {
        queue.playing = false;
        queue.player.pause(true);
        queue.pausedAt = Date.now();
        if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.pause(queue.pausedAt);
        queue.textChannel.send(({ embeds: [{ color: "#bee7f7", description: `${interaction.user} paused the current song ⏸️` }] }))
        interaction.reply('⏸️ pausing...');
        queue.dcTimeout = setTimeout(async() => {
            const embed = new MessageEmbed()
                .setTitle("no music was playing :(")
                .setDescription(`it's been a while since the music queue was paused, so i left the voice channel to reserve data :pensive:\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
            queue.textChannel.send({ embeds: [embed] });
            return client.lavacordManager.leave(queue.textChannel.guild.id);
        }, STAY_TIME * 1000);
    } else {
        return interaction.reply({ content: 'the music is already paused :thinking:', ephemeral: true });
    };
};