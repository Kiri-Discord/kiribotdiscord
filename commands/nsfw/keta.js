//all credit belongs to my friend Crocodile#6300
const neko = require('nekos.life');
const { nsfw } = new neko();
exports.run = async(client, message, args) => {
    const data = await nsfw.keta()
    return message.channel.send(data.url);
}
exports.help = {
    name: "keta",
    description: "send some nsfw keta from bell's homework folder :cry:",
    usage: "keta",
    example: "keta"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    adult: true,

    channelPerms: ["EMBED_LINKS"]
};