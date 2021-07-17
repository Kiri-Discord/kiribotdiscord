//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.spank()
    return message.channel.send(data.url);
}
exports.help = {
    name: "spank",
    description: "send some nsfw spank from bell's homework folder :cry:",
    usage: "spank",
    example: "spank"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};