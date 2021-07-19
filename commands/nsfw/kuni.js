//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.kuni()
    return message.channel.send(`||${data.url}||`);
}
exports.help = {
    name: "kuni",
    description: "send some nsfw kuni from bell's homework folder :cry:",
    usage: "kuni",
    example: "kuni"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};