const { MersenneTwister19937, integer } = require('random-js');
const { MessageEmbed } = require('discord.js');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user') || interaction.member;
    const { user } = member;

    let level;
    if (client.config.owners.includes(user.id)) {
        level = 10;
    } else {
        const random = MersenneTwister19937.seed(user.id);
        level = integer(0, 10)(random);
    };
    const embed = new MessageEmbed()
        .setTitle('pp meter machine')
        .setDescription(`${user.username} peepee\n8${('=').repeat(level)}D`)
        .setColor(member.displayHexColor);
    if (level < 3) embed.setFooter(`that size is fixed to ${user.id === interaction.user.id ? 'your' : 'their'} DNA, running this again won't change anything ¯\\_(ツ)_/¯`)
    return interaction.reply({ embeds: [embed] });
};