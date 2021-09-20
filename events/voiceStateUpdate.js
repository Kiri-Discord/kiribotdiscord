const { MessageEmbed } = require('discord.js');
module.exports = async(client, oldState, newState) => {
    if ((oldState.member.user.bot && oldState.member.user.id !== client.user.id) ||
        (newState.member.user.bot && newState.member.user.id !== client.user.id)) return;
    if (newState.channelId === null || oldState.channelId) { //leaving vc
        const queue = client.queue.get(oldState.guild.id);
        if (!queue) return;
        if (queue.channel.id !== oldState.channelId) return;
        if (newState.member.user.id === client.user.id) {
            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
            await client.lavacordManager.leave(queue.textChannel.guild.id);
            return client.queue.delete(queue.textChannel.guild.id);
        };
        const playerListening = [...queue.channel.members.values()];
        let listening = playerListening.filter(x => !x.user.bot).length;
        if (listening >= 1) return;

        if (queue.playing) {
            queue.playing = false;
            queue.afkPause = true;
            queue.player.pause(true);
            queue.pausedAt = Date.now();
            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.pause(queue.pausedAt);
            if (!queue.dcTimeout) {
                queue.dcTimeout = setTimeout(async() => {
                    await client.lavacordManager.leave(queue.textChannel.guild.id);
                    const embed = new MessageEmbed()
                        .setTitle("it's lonely in here :(")
                        .setDescription(`it's been a while since everyone started leaving the music channel, so i left it too ☹️\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
                    queue.textChannel.send({ embeds: [embed] });
                    if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
                    return client.queue.delete(message.guild.id);
                }, 900000);
            };
        };
    };
    if (oldState.channelId === null) {
        const queue = client.queue.get(newState.guild.id);
        if (!queue) return;
        if (queue.channel.id !== newState.channelId) return;
        if (queue.dcTimeout && queue.afkPause && !queue.playing) {
            clearTimeout(queue.dcTimeout);
            queue.playing = true;
            queue.pausedAt = undefined;
            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.resume(queue.player);
            else queue.player.resume();
            queue.dcTimeout = undefined;
        };
    };
};