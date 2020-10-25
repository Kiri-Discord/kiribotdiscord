module.exports = {
	name: 'creator',
	description: 'more info about my creator',
    cooldown: 2,
    guildOnly: true,
	execute(message) {
		message.channel.send('since the beginning of time, there was **mommarosa**, the mother of all discord bots in the world. all the bots looks the same.\nbut then, \n\n\nsomething happened.\n\nthe end.');
	},
};
