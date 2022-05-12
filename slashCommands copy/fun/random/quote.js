const quotes = require('../../../assets/quote');

exports.run = async(client, interaction, args) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return interaction.reply(`${quote.quote.toLowerCase()}\n- _${quote.author}_`);
};