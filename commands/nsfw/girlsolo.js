//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const choices = ["1", "2"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const data = choice === '1' ? await nsfw.girlSolo() : await nsfw.girlSoloGif();
    return message.channel.send(data.url);
}
exports.help = {
    name: "girlsolo",
    description: "send some nsfw girlsolo from bell's homework folder :cry:",
    usage: "girlsolo",
    example: "girlsolo"
};

exports.conf = {
    aliases: ['sologirl'],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};