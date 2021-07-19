//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.nekoGif();
    return message.channel.send(`||${data.url}||`);
}
exports.help = {
    name: "r18-neko",
    description: "send some nsfw nekos from bell's homework folder :cry:",
    usage: "r18-neko",
    example: "r18-neko"
};

exports.conf = {
    aliases: ["r18neko", "nekor18"],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};