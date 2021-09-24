const { canModifyQueue } = require("../../util/musicutil");

const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (!queue.songs.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `there isn't any song left in the queue :pensive:` }] });
    if (!args.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you must to tell me what song you want to remove! use \`${prefix}help remove\` to learn more :wink:` }] });

    const arguments = args.join(" ");
    let removed = [];
    const songs = arguments.split(",").map((str) => str.trim());

    if (pattern.test(arguments)) {
        if (songs.some(x => x > queue.songs.length)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `that is not a number or a correct position in the queue :pensive:` }] });
        queue.songs = queue.songs.filter((item, index) => {
            if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
            else return true;
        });
        if (queue.textChannel.id !== message.channel.id) message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ you removed **${removed.map((song) => song.info.title).join("\n")}** from the queue` }] });
        return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} removed **${removed.map((song) => song.info.title).join("\n")}** from the queue ❌` }] })
    } else if (!isNaN(args[0]) && songs.length <= 1 && args[0] > 1 && args[0] <= queue.songs.length) {
        if (queue.textChannel.id !== message.channel.id) message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ you removed **${queue.songs.splice(args[0] - 1, 1)[0].info.title}** from the queue ❌` }] });
        return queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} removed **${queue.songs.splice(args[0] - 1, 1)[0].info.title}** from the queue ❌` }] });
    } else {
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `wrong usage! use \`${prefix}help remove\` to learn more :wink:` }] });
    };
};

exports.help = {
    name: "remove",
    description: "remove a song from the queue",
    usage: "remove `<postion of track>`",
    example: ["remove `1`", "remove `4, 2, 6`"]
}

exports.conf = {
    aliases: ["clear", "rm"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}