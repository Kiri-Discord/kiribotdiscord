const choices = ['rock', 'paper', 'scissors'];

exports.run = async (client, message, args) => {
    const choice = args[0]
    if (!choice) return message.reply("i win cuz you didn't do anything :(")
    const response = choices[Math.floor(Math.random() * choices.length)];
    if (choice.toLowerCase() === 'rock') {
        if (response === 'rock') return message.channel.send('rock! aw... a tie...');
        if (response === 'paper') return message.channel.send('paper! yes! i win!');
        if (response === 'scissors') return message.channel.send('scissors! aw... i lose...');
    }
    if (choice.toLowerCase() === 'paper') {
        if (response === 'rock') return message.channel.send('rock! aw... i lose...');
        if (response === 'paper') return message.channel.send('paper! aw... a tie...');
        if (response === 'scissors') return message.channel.send('scissors! yes! i win!');
    }
    if (choice.toLowerCase() === 'scissors') {
        if (response === 'rock') return message.channel.send('rock! yes! i win!');
        if (response === 'paper') return message.channel.send('paper! aw... i lose...');
        if (response === 'scissors') return message.channel.send('scissors! aw... a tie...');
    }
    return message.reply('i win by default, you little cheater :(');
}

exports.help = {
	name: "rock-paper-scissors",
	description: "rock, player, scissors! right on Discord!",
	usage: "rock-paper-scissors <rock | paper | scissors>",
	example: "rock-paper-scissors paper"
};
  
exports.conf = {
	aliases: ["rps", "rockpaperscissors"],
	cooldown: 7
};