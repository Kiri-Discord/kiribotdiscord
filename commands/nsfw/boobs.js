//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const choices = ["1", "2"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const data = choice === '1' ? await nsfw.boobs() : await nsfw.tits();
    return message.channel.send(data.url);
}
exports.help = {
    name: "boobs",
    description: "send some nsfw boobs from bell's homework folder :cry:",
    usage: "boobs",
    example: "boobs"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true
};