const fetch = require('node-fetch');

exports.run = async(client, message, args) => {
    let tag;

    if (args[0] && args[0].includes('@')) {
        tag = args[0];
    } else {
        tag = '';
    };
    fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
        .then(res => res.json())
        .then(json => message.channel.send(`${tag} :fire: ${json.insult}`))
        .catch(err => {
            message.channel.send("sorry! i got an error. can you try again later? :pensive:");
            return logger.log('error', err);
        });
};

exports.help = {
    name: "insult",
    description: "gives an evil insult or insults someone",
    usage: ["insult `[@user]`", "insult"],
    example: ["insult `@Bell`", "insult"]
};

exports.conf = {
    aliases: ["burn", "roast"],
    cooldown: 3,
    guildOnly: true,
};