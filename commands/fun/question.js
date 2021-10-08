const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    try {
        message.channel.sendTyping();
        let text = await sfw.why();
        return message.channel.send(text.why.toLowerCase())
    } catch (error) {
        return message.channel.send('hmm, something happened when i was trying to get you a random question :pensive:')
    };
};

exports.help = {
    name: "question",
    description: "send you a random question :thinking:",
    usage: ["question"],
    example: ["question"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
};