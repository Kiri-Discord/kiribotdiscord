const req = require('node-superfetch');

exports.run = async(client, message, args) => {
    try {
        message.channel.sendTyping();
        const { body } = await req.get('http://api.adviceslip.com/advice');
        return message.channel.send(JSON.parse(body.toString()).slip.advice.toLowerCase());
    } catch (e) {
        logger.log('error', e);
        return message.channel.send(`i can't seem to be able to give you an advice :pensive: here is a hug for now 🤗`);
    };
};

exports.help = {
    name: "advice",
    description: "gives you a random advice",
    usage: ["advice"],
    example: ["advice"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
};