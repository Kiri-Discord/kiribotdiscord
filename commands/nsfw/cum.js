//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const choices = ["1", "2"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const data = choice === '1' ? await nsfw.cumsluts() : await nsfw.cumArts();
    return message.channel.send(data.url);
}
exports.help = {
    name: "cum",
    description: "send some nsfw cum from bell's homework folder :cry:",
    usage: "cum",
    example: "cum"
};

exports.conf = {
    aliases: ['cumsluts'],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};