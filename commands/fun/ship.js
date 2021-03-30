const { MersenneTwister19937, integer } = require('random-js');

exports.run = async (client, message, args) => {
    let first;
    let second;
    if (args.length >= 2) {
		if (message.mentions.users.size >= 2) {
			const userArray = message.mentions.users.array();
			first = userArray[0];
			second = userArray[1];
		} else {
			first = message.mentions.users.first();
			second = message.mentions.users.first();
		}
    } else {
        first = message.author;
        second = message.mentions.users.first();
    }
    if (!second) return message.reply('you must to mention someone!');
    if (first.id === client.user.id) return message.channel.send('well you decide it yourself tho');
    if (second.id === client.user.id) return message.channel.send('well you decide it yourself tho');
    if (first.bot) return message.reply('well, a relationship between an user and a bot is always great :)\n||*most of the time*||');
    if (second.bot) return message.reply('well, a relationship between an user and a bot is always great :)\n||*most of the time*||');
    let level;
    const self = first.id === second.id;
    if (self) {
        level = 100;
    } else {
		const calculated = Math.abs(Number.parseInt(BigInt(first.id) - BigInt(second.id), 10));
		const random = MersenneTwister19937.seed(calculated);
		level = integer(0, 100)(random);
    }
    return message.channel.send(`there is ${level}% love between **${first.username}** and **${second.username}**, ${calculateLevelText(level, self)}`);
}

function calculateLevelText(level, self) {
    if (self) return 'narcissist';
    if (level === 0) return 'abysmal';
    if (level > 0 && level < 10) return 'which means that their relationship is horrid :(';
    if (level > 9 && level < 20) return 'which is awful';
    if (level > 19 && level < 30) return 'which is very bad';
    if (level > 29 && level < 40) return 'which is bad';
    if (level > 39 && level < 50) return 'which is poor';
    if (level > 49 && level < 60) return 'which is average';
    if (level > 59 && level < 70) {
        if (level === 69) return 'nice';
        return 'fine';
    }
    if (level > 69 && level < 80) return 'which is good :)';
    if (level > 79 && level < 90) return 'which is great :)';
    if (level > 89 && level < 100) return 'which is amazing :D';
    if (level === 100) return 'which means that they are for each other!';
    return '???';
}


exports.help = {
	name: "ship",
	description: "ship two user together with their love meter ^^",
	usage: ["ship `<@mention>`", "ship `<@mention> [@mention]`"],
	example: ["friendship `@someone`", "friendship `@someone @anotherone`"]
};
  
exports.conf = {
	aliases: ["love-test", "rateship"],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};