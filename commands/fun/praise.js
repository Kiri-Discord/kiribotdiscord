const fetch = require('node-fetch');

exports.run = async(client, message, args) => {
    fetch('https://complimentr.com/api')
        .then(res => res.json())
        .then(json => message.reply(json.compliment.toLowerCase()))
        .catch(err => {
            message.reply("i can't seem to be able to praise you :( here is a hug for now 🤗");
            return logger.log('error', err);
        });
};

exports.help = {
    name: "praise",
    description: "give you a free compliment ;)",
    usage: ["praise"],
    example: ["praise"]
};

exports.conf = {
    aliases: ["praiseme", "freecompliment"],
    cooldown: 3,
    guildOnly: true,
};