const fetch = require('node-fetch');


exports.run = async (client, message, args) => {
    fetch(`https://sv443.net/jokeapi/v2/joke/Any?`)
    .then(res => res.json())
    .then(json => {
        if (json.setup) {
            message.channel.send(`${json.setup}\n${json.delivery}`);
        } else if (json.joke) {
            message.channel.send(`${json.joke}`);
        } else if (json.additionalInfo) {
            message.channel.send(json.additionalInfo);
        }
    })
    .catch(err => {
        message.channel.send("i can't seem to be able to give you a fact :( here is a hug for now 🤗");
        return console.error(err);
    });
};


exports.help = {
	name: "joke",
	description: "Gives you a random joke",
	usage: "joke",
	example: "joke"
};
  
exports.conf = {
	aliases: [""],
	cooldown: 3
};