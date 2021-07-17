//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    let data;
    const choices = ["1", "2", "3"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === '1') data = await nsfw.yuri()
    else if (choice === '2') data = await nsfw.eroYuri()
    else data = await nsfw.lesbian()
    return message.channel.send(data.url);
}
exports.help = {
    name: "yuri",
    description: "send some nsfw yuri from bell's homework folder :cry:",
    usage: "yuri",
    example: "yuri"
};

exports.conf = {
    aliases: ["lesbian", "les"],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};