//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.avatar();
    return message.channel.send(data.url);
}
exports.help = {
    name: "r18-avatar",
    description: "grab some nsfw pfp from bell's homework folder :cry:",
    usage: "r18-avatar",
    example: "r18-avatar"
};

exports.conf = {
    aliases: ["r18pfp", "r18avatar"],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};