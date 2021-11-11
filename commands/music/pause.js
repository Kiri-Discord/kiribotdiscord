const { canModifyQueue, STAY_TIME } = require("../../util/musicutil");
const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply('there is nothing to pause since i\'m not playing anything :grimacing:').catch(err => logger.log('error', err));
    if (!canModifyQueue(message.member)) return message.reply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} to listen :wink:`);
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });

    if (queue.playing) {
        queue.playing = false;
        queue.player.pause(true);
        queue.pausedAt = Date.now();
        if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.pause(queue.pausedAt);
        message.channel.send({ embeds: [{ color: "#bee7f7", description: `you paused the current song ⏸️` }] });

        if (queue.textChannel.id !== message.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} paused the current song ⏸️` }] })
        queue.dcTimeout = setTimeout(async() => {
            const embed = new MessageEmbed()
                .setTitle("no music was playing :(")
                .setDescription(`it's been a while since the music queue was paused, so i left the voice channel to reserve data :pensive:\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${client.config.prefix}24/7\` for supporters! stay tuned <3`)
            queue.textChannel.send({ embeds: [embed] });
            return client.lavacordManager.leave(queue.textChannel.guild.id);
        }, STAY_TIME * 1000);
        if (queue.textChannel.deleted) queue.textChannel = message.channel;
    } else {
        return message.channel.send('the music is already paused :thinking:')
    }
}
exports.help = {
    name: "pause",
    description: "pause the current playing song",
    usage: ["pause"],
    example: ["pause"]
}

exports.conf = {
    aliases: ["p"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}