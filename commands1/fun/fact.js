const req = require('node-superfetch');
exports.run = async(client, message, args) => {
    message.channel.sendTyping();
    try {
        const { body } = await req.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = body.text.toLowerCase().split('`').join("'");
        return message.channel.send(fact);
    } catch {
        message.channel.send("i can't seem to be able to give you a fact :( here is a hug for now 🤗");
        return logger.log('error', err);
    };
};

exports.help = {
    name: "fact",
    description: "gives you a fun, random fact.",
    usage: ["fact"],
    example: ["fact"]
};

exports.conf = {
    aliases: ["funfact"],
    cooldown: 3,
    guildOnly: true,
};