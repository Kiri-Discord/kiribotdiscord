exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    queue.debug = !queue.debug;
    return message.reply({ embeds: [{ color: "#bee7f7", description: `music debugging is turned ${queue.debug ? "on" : "off"} for the current queue! feel free to check \`${prefix}invite\` to get more info about support servers if i'm stuck somewhere ^^` }] })
};

exports.help = {
    name: "autoplay",
    description: "automatically play related songs after your queue ends based on the last song in your queue",
    longDescription: "when autoplay is enabled, i will automatically play related songs after your queue ends. it's amazing for discovering new music, or for when you're background listening and don't want to hear the same playlist every time!",
    usage: ["autoplay"],
    example: ["autoplay"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};