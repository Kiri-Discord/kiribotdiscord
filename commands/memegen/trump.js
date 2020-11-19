const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {

    
    // Get message
    if (!args[0]) return message.channel.send('Indicate what Trump should speak pls :D');
    let tweet = message.content.slice(message.content.indexOf(args[0]), message.content.length);
    if (tweet.length > 68) tweet = tweet.slice(0, 65) + '...';

    try {
      const res = await fetch('https://nekobot.xyz/api/imagegen?type=trumptweet&text=' + tweet);
      const img = (await res.json()).message;
      message.channel.send({files: [{ attachment: img, name: "trump.png"}]});
    } catch (err) {
      console.error(error)
      message.channel.send('ouch, i fell while collecting his tweet :( try again pls');
    }
  }

exports.help = {
	name: "trump",
	description: "make trump say something on Twiiter :)",
	usage: "trump <message>",
	example: "trump hi"
};
  
exports.conf = {
	aliases: ["trumptweet", "tweettrump"],
	cooldown: 2
};
