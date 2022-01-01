const { canModifyQueue } = require("../../util/musicutil");
const humanize = require('humanize-duration');
const timestring = require('timestring');
const { sec } = require('../../util/util');

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (queue.karaoke.isEnabled) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `seeking is not possible when scrolling-lyrics is on :pensive: you can turn it off by \`${prefix}scrolling-lyrics off\`` }] });

    const song = queue.nowPlaying;
    if (!song) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: the song haven't played yet :pensive:` }] });
    if (!song.info.isSeekable) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `sorry, that song is unseekable :pensive:` }] });
    const seek = queue.player.state.position;
    if (!seek) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `the song haven't started yet :slight_smile:` }] });
    if (song.requestedby.id !== message.author.id && !message.member.permissions.has('MANAGE_MESSAGES')) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you don't have the permission to do it since you didn't request the song, or you don't have \`MANAGE_MESSAGES\` to seek it :(` }] });

    const query = args.join(" ");
    if (!query) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `where would you want the song to seek to? for example \`04:05\` or \`2m 6s\` :slight_smile:` }] });
    let time;
    try {
        time = timestring(query);
    } catch {
        time = sec(query);
    };

    const timeMs = time * 1000;
    if (timeMs > song.info.length - 5) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `that is wayy longer than the current playing song! can you check it again?` }] });
    queue.player.seek(timeMs);
    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `seeked to **${humanize(timeMs)}** of **[${song.info.title}](${song.info.uri})** - **${song.info.author}** [${song.requestedby}] 🚚` }] });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you seeked to **${humanize(timeMs)}** of **[${song.info.title}](${song.info.uri})**! 🚚` }] })
};
exports.help = {
    name: "seek",
    description: "seek to a certain point of the song",
    usage: ["seek \`<timestamp>\`"],
    example: ["seek \`03:58\`", "seek \`1m 26s\`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};