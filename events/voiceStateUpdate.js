const { MessageEmbed } = require('discord.js');
module.exports = async(client, oldState, newState) => {
    if (oldState.member.user.bot || newState.member.user.bot) return;
    if (newState.channelID === null) { //leaving vc
        const queue = client.queue.get(oldState.guild.id);
        if (!queue) return;
        if (!queue.channel.members.filter(x => !x.user.bot).size > 2) return;

        if (queue.playing) {
            queue.playing = false;
            queue.afkPause = true;
            queue.connection.dispatcher.pause(true);
            if (queue.karaoke.isEnabled) {
                queue.karaoke.timeout.forEach(x => {
                    clearTimeout(x);
                });
                queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
            };
            if (!queue.dcTimeout) {
                queue.dcTimeout = setTimeout(async() => {
                    await queue.connection.disconnect();
                    const embed = new MessageEmbed()
                        .setTitle("it's lonely in here :(")
                        .setDescription(`it's been a while since everyone started leaving the music channel, so i left it too ☹️\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
                    return queue.textChannel.send(embed);
                }, 900000);
            };
        };
    };
    if (oldState.channelID === null) {
        const queue = client.queue.get(oldState.guild.id);
        if (!queue) return;
        if (queue.dcTimeout && queue.afkPause && !queue.playing) {
            clearTimeout(queue.dcTimeout)
            queue.playing = true;
            queue.connection.dispatcher.resume();
            queue.dcTimeout = undefined;
        };
    };
};