const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
    fetch('https://uselessfacts.jsph.pl/random.json?language=en')
    .then(res => res.json())
    .then(json => message.channel.send(json.text.toLowerCase()))
    .catch(err => {
        message.channel.send("i can't seem to be able to give you a fact :( here is a hug for now 🤗");
        return console.error(err);
    });
},

exports.help = {
	name: "fact",
	description: "gives you a fun, random fact.",
	usage: "fact",
	example: "fact"
};
  
exports.conf = {
	aliases: ["funfact"],
    cooldown: 3,
    guildOnly: true,
};