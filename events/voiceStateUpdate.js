const { MessageEmbed } = require('discord.js');
module.exports = async(client, oldState, newState) => {
    if ((oldState.member.user.bot && oldState.member.user.id !== client.user.id) ||
        (newState.member.user.bot && newState.member.user.id !== client.user.id)) return;
    if (newState.channelID === null || oldState.channelID) { //leaving vc
        const queue = client.queue.get(oldState.guild.id);
        if (!queue) return;
        if (queue.channel.id !== oldState.channelID) return;
        if (newState.member.user.id === client.user.id) {
            await client.lavacordManager.leave(queue.textChannel.guild.id);
            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
            return client.queue.delete(queue.textChannel.guild.id);
        };
        const playerListening = queue.channel.members.array();
        let listening = playerListening.filter(x => !x.user.bot).length;
        if (listening >= 1) return;

        if (queue.playing) {
            queue.playing = false;
            queue.afkPause = true;
            await queue.player.pause(true);
            queue.pausedAt = Date.now();
            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.pause();
            if (!queue.dcTimeout) {
                queue.dcTimeout = setTimeout(async() => {
                    await client.lavacordManager.leave(queue.textChannel.guild.id);
                    const embed = new MessageEmbed()
                        .setTitle("it's lonely in here :(")
                        .setDescription(`it's been a while since everyone started leaving the music channel, so i left it too ☹️\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
                    queue.textChannel.send(embed);
                    await queue.karaoke.instance.stop();
                    return client.queue.delete(message.guild.id);
                }, 900000);
            };
        };
    };
    if (oldState.channelID === null) {
        const queue = client.queue.get(newState.guild.id);
        if (!queue) return;
        if (queue.channel.id !== newState.channelID) return;
        if (queue.dcTimeout && queue.afkPause && !queue.playing) {
            clearTimeout(queue.dcTimeout)
            queue.playing = true;
            queue.pausedAt = undefined;
            await queue.player.resume();
            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.resume();
            queue.dcTimeout = undefined;
        };
    };
};