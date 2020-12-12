const req = require('node-superfetch');

exports.run = async (client, message, args) => {
    try {
        const {
          body
        } = await req.get('http://api.adviceslip.com/advice');
        message.channel.send(JSON.parse(body.toString()).slip.advice.toLowerCase());
    } catch (e) {
        console.log(e);
        message.channel.send(`i can't seem to be able to give you a fact :( here is a hug for now 🤗`);
    }
};

exports.help = {
	name: "advice",
	description: "gives you a random advice",
	usage: "advice",
	example: "advice"
};
  
exports.conf = {
	aliases: [],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};