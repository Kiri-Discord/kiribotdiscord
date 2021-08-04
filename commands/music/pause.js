const { canModifyQueue } = require("../../util/musicutil");
const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to pause since i\'m not playing anything :grimacing:').catch(console.error);
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);


    if (queue.playing) {
        queue.playing = false;
        queue.player.pause(true);
        queue.textChannel.send(({ embed: { color: "f3f3f3", description: `${message.author} paused the current song ⏸️` } }))
        if (queue.textChannel.id !== message.channel.id) message.channel.send('⏸️ pausing...');
        queue.karaoke.timeout.forEach(x => {
            clearTimeout(x);
        });
        queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
        queue.pausedAt = Date.now();
        queue.dcTimeout = setTimeout(async() => {
            await client.lavacordManager.leave(queue.textChannel.guild.id);
            const embed = new MessageEmbed()
                .setTitle("no music was playing :(")
                .setDescription(`it's been a while since the music queue was paused, so i left the voice channel to reserve data :pensive:\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
            queue.textChannel.send(embed);
            return client.queue.delete(message.guild.id);
        }, 1200000);
    } else {
        return message.channel.send('the music is already paused :thinking:')
    }
}
exports.help = {
    name: "pause",
    description: "pause the current playing song",
    usage: "pause",
    example: "pause"
}

exports.conf = {
    aliases: ["p"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}