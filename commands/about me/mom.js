exports.run = async(client, message, args) => {
    message.channel.send('since the beginning of time, there was **mommarosa**, the mother of all discord bots in the world. all the bots looks the same.\nbut then, \n\n\nsomething happened.\n\nthe end.');

};
exports.help = {
    name: "mom",
    description: "more info about my mom :)",
    usage: ["mom"],
    example: ["mom"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
};