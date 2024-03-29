const { MessageEmbed } = require('discord.js');
const { STAY_TIME } = require("../util/musicutil");
module.exports = async(client, oldState, newState) => {
    if ((oldState.member.user.bot && oldState.member.user.id !== client.user.id) ||
        (newState.member.user.bot && newState.member.user.id !== client.user.id)) return;
    if (newState.channelId === null) {
        const queue = client.queue.get(oldState.guild.id);
        if (newState.member.user.id === client.user.id) {
            if (client.dcTimeout.has(oldState.guild.id)) {
                const timeout = client.dcTimeout.get(oldState.guild.id);
                clearTimeout(timeout);
                return client.dcTimeout.delete(oldState.guild.id);
            };
            if (!queue) return;
            if (queue.channel.id !== oldState.channelId) return;
            return queue.stop('disconnected');
        };
        if (!queue) return;
        if (queue.channel.id !== oldState.channelId) return;
        const playerListening = [...queue.channel.members.values()];
        let listening = playerListening.filter(x => !x.user.bot).length;
        if (listening >= 1) return;

        if (queue.playing) {
            queue.playing = false;
            queue.afkPause = true;
            queue.player.pause(true);
            if (!queue.dcTimeout) {
                queue.dcTimeout = setTimeout(async() => {
                    const embed = new MessageEmbed()
                        .setTitle("it's lonely in here :(")
                        .setDescription(`it's been a while since everyone started leaving the music channel, so i left it too ☹️\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
                    queue.textChannel.send({ embeds: [embed] });
                    queue.dcTimeout = undefined;
                    return client.lavacordManager.leave(queue.guildId);
                }, STAY_TIME * 1000);
            };
        };
    } else if (oldState.channelId === null) {
        if (oldState.member.user.id === client.user.id) return;
        const queue = client.queue.get(newState.guild.id);
        if (!queue) return;
        if (queue.channel.id !== newState.channelId) return;
        if (queue.dcTimeout && queue.afkPause && !queue.playing) {
            clearTimeout(queue.dcTimeout);
            queue.playing = true;
            queue.dcTimeout = undefined;
            queue.player.resume();
        };
    } else if (oldState.channelId && newState.channelId && newState.member.user.id === client.user.id && oldState.member.user.id === client.user.id) {
        const queue = client.queue.get(newState.guild.id);
        if (!queue) return;
        if (queue.channel.id !== oldState.channelId) return;
        queue.channel = newState.channel;

        const playerListening = [...queue.channel.members.values()];
        let listening = playerListening.filter(x => !x.user.bot).length;
        if (listening >= 1) return;

        if (queue.playing) {
            queue.playing = false;
            queue.afkPause = true;
            queue.player.pause(true);
            if (!queue.dcTimeout) {
                queue.dcTimeout = setTimeout(async() => {
                    const embed = new MessageEmbed()
                        .setTitle("it's lonely in here :(")
                        .setDescription(`it's been a while since everyone started leaving the music channel, so i left it too ☹️\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
                    queue.textChannel.send({ embeds: [embed] });
                    queue.dcTimeout = undefined;
                    return client.lavacordManager.leave(queue.guildId);
                }, STAY_TIME * 1000);
            };
        };
    } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const queue = client.queue.get(newState.guild.id);
        if (!queue) return;
        if (oldState.channelId === queue.channel.id) {
            const playerListening = [...queue.channel.members.values()];
            let listening = playerListening.filter(x => !x.user.bot).length;
            if (listening >= 1) return;

            if (queue.playing) {
                queue.playing = false;
                queue.afkPause = true;
                queue.player.pause(true);
                if (!queue.dcTimeout) {
                    queue.dcTimeout = setTimeout(async() => {
                        const embed = new MessageEmbed()
                            .setTitle("it's lonely in here :(")
                            .setDescription(`it's been a while since everyone started leaving the music channel, so i left it too ☹️\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
                        queue.textChannel.send({ embeds: [embed] });
                        queue.dcTimeout = undefined;
                        return client.lavacordManager.leave(queue.guildId);
                    }, STAY_TIME * 1000);
                };
            };
        };
        if (newState.channelId === queue.channel.id) {
            if (queue.dcTimeout && queue.afkPause && !queue.playing) {
                clearTimeout(queue.dcTimeout);
                queue.playing = true;
                queue.dcTimeout = undefined;
                queue.player.resume();
            };
        };
    };
};