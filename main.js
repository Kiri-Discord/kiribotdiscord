const Discord = require('discord.js');

const client = new Discord.Client();


client.once('ready', () => {
    console.log(`i am ready!`);
});



client.login(process.env.token);