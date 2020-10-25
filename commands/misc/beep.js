module.exports = {
	name: 'beep',
	description: 'very self-explanatory',
	cooldown: 2,
	guildOnly: true,
	execute(message) {
		message.channel.send('boop.');
	},
};
