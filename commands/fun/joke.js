const fetch = require('node-fetch');
exports.run = async(client, message, args) => {
    message.channel.sendTyping();
    let jokeFilter;
    if (!message.channel.nsfw) jokeFilter = "blacklistFlags=nsfw,religious,political,racist,sexist";
    else jokeFilter = "";
    fetch(`https://sv443.net/jokeapi/v2/joke/Any?${jokeFilter}`)
        .then(res => res.json())
        .then(json => {
            if (json.setup) {
                message.channel.send(`${json.setup.toLowerCase()}\n${json.delivery.toLowerCase()}`);
            } else if (json.joke) {
                message.channel.send(`${json.joke.toLowerCase()}`);
            } else if (json.additionalInfo) {
                message.channel.send(json.additionalInfo.toLowerCase());
            }
        })
        .catch(err => {
            message.reply("i can't seem to be able to give you a fact :( here is a hug for now 🤗");
            return logger.log('error', err);
        });
};


exports.help = {
    name: "joke",
    description: "gives you a random joke",
    usage: ["joke"],
    example: ["joke"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
};