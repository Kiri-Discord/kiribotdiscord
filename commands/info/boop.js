exports.run = async(client, message, args) => {
    return message.reply('are you in pain?');
};
exports.help = {
    name: "boop",
    description: "if you run this you autist",
    usage: ["boop"],
    example: ["boop"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
};