const quotes = require('../../assets/quote');

exports.run = async (client, message, args) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return message.channel.send(`${quote.quote.toLowerCase()}\n- _${quote.author}_`);
};

exports.help = {
  name: "quote",
  description: "say a random quote",
  usage: "quote",
  example: ["quote"]
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: true,
}