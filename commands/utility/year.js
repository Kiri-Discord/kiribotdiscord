exports.run = async(client, message, args) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear() + 1, 0, 1);
    const percent = (Math.abs(today - start) / Math.abs(end - start)) * 100;
    return message.channel.send(`**${today.getFullYear()}** is **${percent}%** complete!`);
}
exports.help = {
    name: "year",
    description: "track the year's progress",
    usage: "year",
    example: "year"
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,
};