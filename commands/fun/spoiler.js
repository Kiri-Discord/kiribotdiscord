const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    let query = args.join(' ');
    const duh = client.customEmojis.get('duh');
    if (!query) return message.reply(`you must tell me what to turn into spoiler ${duh}`)
    message.channel.sendTyping();
    let text = await sfw.spoiler({ text: query });
    return message.channel.send(text.owo);
};

exports.help = {
    name: "spoiler",
    description: "transform your text into spoilers 🙃",
    usage: ["spoiler `<text>`"],
    example: ["spoiler `this should be in spoiler`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
};