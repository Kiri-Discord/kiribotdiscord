//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    let data;
    const choices = ["1", "2", "3"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === '1') data = await nsfw.pussy()
    else if (choice === '2') data = await nsfw.pussyArt()
    else data = await nsfw.pussyWankGif()
    return message.channel.send(data.url);
}
exports.help = {
    name: "pussy",
    description: "send some nsfw pussy from bell's homework folder :cry:",
    usage: "pussy",
    example: "pussy"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};