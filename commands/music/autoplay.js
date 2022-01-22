const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.karaoke.isEnabled) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `autoplay is not possible when scrolling lyrics is on :pensive: you can turn it off by \`${prefix}scrolling-lyrics off\`` }] });
    queue.autoPlay = !queue.autoPlay;
    const autoEmoji = client.customEmojis.get('autoplay') ? client.customEmojis.get('autoplay').toString() : '🔁'
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `${autoEmoji} autoplay has been turned ${queue.autoPlay ? "on" : "off"} for the current queue! i will start enqueuing new song when the queue is empty!` }] })
};

exports.help = {
    name: "autoplay",
    description: "automatically play related songs after your queue ends based on the last song in your queue",
    longDescription: "when autoplay is enabled, i will automatically play related songs after your queue ends. it's amazing for discovering new music, or for when you're background listening and don't want to hear the same playlist every time!",
    usage: ["autoplay"],
    example: ["autoplay"]
};

exports.conf = {
    aliases: ['auto-play'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};