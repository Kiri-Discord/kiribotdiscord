const { MersenneTwister19937, integer } = require('random-js');

exports.run = async(client, message, args) => {
    let first;
    let second;
    if (args[1]) {
        first = await getMemberfromMention(args[0], message.guild)
        second = await getMemberfromMention(args[1], message.guild)
    } else {
        first = message.member;
        second = await getMemberfromMention(args[0], message.guild)
    };

    if (!second) return message.reply('you got to mention a member in this server!');
    if (first.user.id === client.user.id) return message.channel.send('well you decide it yourself tho');
    if (second.user.id === client.user.id) return message.channel.send('well you decide it yourself tho');
    if (first.user.bot) return message.reply('well, a relationship between an user and a bot is always great :)\n||*most of the time*||');
    if (second.user.bot) return message.reply('well, a relationship between an user and a bot is always great :)\n||*most of the time*||');
    let level;
    const self = first.user.id === second.user.id;
    if (self) {
        level = 100;
    } else {
        const calculated = Math.abs(Number.parseInt(BigInt(first.user.id) - BigInt(second.user.id), 10));
        const random = MersenneTwister19937.seed(calculated);
        level = integer(0, 100)(random);
    }
    return message.channel.send(`there is ${level}% love between **${first.user.username}** and **${second.user.username}**, ${calculateLevelText(level, self)}`);
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
    description: "ship two user together and calculate their love meter",
    usage: ["ship `<@mention>`", "ship `<@mention> [@mention]`"],
    example: ["friendship `@someone`", "friendship `@someone @anotherone`"]
};

exports.conf = {
    aliases: ["love-test", "rateship"],
    cooldown: 3,
    guildOnly: true,
};