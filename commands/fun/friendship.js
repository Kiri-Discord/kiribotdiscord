const { MersenneTwister19937, integer } = require('random-js');

exports.run = async (client, message, args) => {
    const first = message.author;
    const second = message.mentions.users.first();
    if (!second) return message.reply('you must to mention someone!');
    if (second.id === client.user.id) return message.channel.send('well you decide it yourself tho')
    if (second.bot) return message.reply('well, a relationship between an user and a bot is always great :)\n||*most of the time*||');
    let level;
    const self = first.id === second.id;
    if (self) {
        level = 100;
    } else {
        const calculated = -Math.abs(Number.parseInt(BigInt(first.id) - BigInt(second.id), 10));
        const random = MersenneTwister19937.seed(calculated);
        level = integer(0, 100)(random);
    }
    return message.channel.send(`there is ${level}% friendship between ${first.username} and ${second.username}, ${calculateLevelText(level, self)}`);
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
    if (level === 100) return 'which means that they are besties';
    return '???';
}


exports.help = {
	name: "friendship",
	description: "determines how good you and a user are.",
	usage: "friendship `<@mention>`",
	example: "friendship `@someone`"
};
  
exports.conf = {
	aliases: ["friendmeter", "ratefriendship"],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
	clientPerms: []
};