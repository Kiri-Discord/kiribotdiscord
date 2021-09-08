exports.run = async(client, message, args) => {
    return message.channel.send('don\'t hit me in the face lmao');
};
exports.help = {
    name: "pong",
    description: "DON'T DO THIS",
    usage: "pong",
    example: "pong"
};

exports.conf = {
    aliases: [],
    cooldown: 2,
};