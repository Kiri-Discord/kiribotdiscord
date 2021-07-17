//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.femdom()
    return message.channel.send(data.url);
}
exports.help = {
    name: "femdom",
    description: "send some nsfw femdom from bell's homework folder :cry:",
    usage: "femdom",
    example: "femdom"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};