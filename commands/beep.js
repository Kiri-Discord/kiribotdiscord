module.exports = {
	name: 'beep',
	description: 'very self-explanatory',
	cooldown: 2,
	execute(message) {
		message.channel.send('boop.');
	},
};
