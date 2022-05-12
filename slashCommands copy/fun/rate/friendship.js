const { MersenneTwister19937, integer } = require('random-js');

exports.run = async(client, interaction) => {
    let first;
    let second;
    if (interaction.options.getMember('user2')) {
        first = interaction.options.getMember('user1');
        second = interaction.options.getMember('user2');
    } else {
        first = interaction.member;
        second = interaction.options.getMember('user1');
    };
    let level;
    const self = first.user.id === second.user.id;
    if (self) {
        level = 100;
    } else {
        const calculated = -Math.abs(Number.parseInt(BigInt(first.user.id) - BigInt(second.user.id), 10));
        const random = MersenneTwister19937.seed(calculated);
        level = integer(0, 100)(random);
    }
    return interaction.reply(`there is **${level}%** friendship between **${first.user.username}** and **${second.user.username}**!`);
};