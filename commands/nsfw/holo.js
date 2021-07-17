//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const choices = ["1", "2"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const data = choice === '1' ? await nsfw.holo() : await nsfw.holoEro();
    return message.channel.send(data.url);
}
exports.help = {
    name: "holo",
    description: "send some nsfw holo from bell's homework folder :cry:",
    usage: "holo",
    example: "holo"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};