//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.anal();
    return message.channel.send(data.url);
}
exports.help = {
    name: "anal",
    description: "send some nsfw anal from bell's homework folder :cry:",
    usage: "anal",
    example: "anal"
};

exports.conf = {
    aliases: ['an'],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};