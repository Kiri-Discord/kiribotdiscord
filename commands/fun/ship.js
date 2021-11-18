const { MersenneTwister19937, integer } = require('random-js');

exports.run = async(client, message, args) => {
    let first;
    let second;
    if (args[1]) {
        first = client.utils.parseMember(message, args[0])
        second = client.utils.parseMember(message, args[1])
        if (!first || !second) return message.channel.send("i don't quite recognize either the first or the second ID that you given :pensive:");
    } else {
        first = message.member;
        if (!args[0]) return message.channel.send('you got to mention a member in this server!');
        second = client.utils.parseMember(message, args[0])
        if (!second) return message.channel.send("can you check the mention or ID again? i don't quite catch that :pensive:");
    };
    let level;
    const self = first.user.id === second.user.id;
    if (self) {
        level = 100;
    } else {
        const calculated = Math.abs(Number.parseInt(BigInt(first.user.id) - BigInt(second.user.id), 10));
        const random = MersenneTwister19937.seed(calculated);
        level = integer(0, 100)(random);
    };
    return message.channel.send(`there is ${level}% love between **${first.user.username}** and **${second.user.username}**!`);
};

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