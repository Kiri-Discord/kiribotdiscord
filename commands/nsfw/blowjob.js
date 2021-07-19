//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const choices = ["1", "2"];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const data = choice === '1' ? await nsfw.bJ() : await nsfw.blowJob();
    return message.channel.send(`||${data.url}||`);
}
exports.help = {
    name: "blowjob",
    description: "send some nsfw blowjob from bell's homework folder :cry:",
    usage: "blowjob",
    example: "blowjob"
};

exports.conf = {
    aliases: ['bj'],
    cooldown: 3,
    guildOnly: true,
    adult: true,
};