//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.gasm()
    return message.channel.send(`||${data.url}||`);
}
exports.help = {
    name: "gasm",
    description: "send some nsfw gasm from bell's homework folder :cry:",
    usage: "gasm",
    example: "gasm"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true
};