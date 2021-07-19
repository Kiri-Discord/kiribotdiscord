//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    let data;
    const choices = ["1", "2", "3"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === '1') data = await nsfw.feet()
    else if (choice === '2') data = await nsfw.feetGif()
    else data = await nsfw.eroFeet()
    return message.channel.send(`||${data.url}||`);
}
exports.help = {
    name: "feet",
    description: "send some nsfw feet from bell's homework folder :cry:",
    usage: "feet",
    example: "feet"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};