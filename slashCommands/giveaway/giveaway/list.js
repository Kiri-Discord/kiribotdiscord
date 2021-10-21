const { MessageEmbed } = require('discord.js');
const { embedURL } = require('../../../util/util');

exports.run = async(client, interaction) => {
    const onServer = client.giveaways.giveaways
        .filter(g => g.guildId === interaction.guild.id);
    if (!onServer || !onServer.length) return interaction.reply({
        embeds: [{
            description: ":boom: sorry, there isn't any existing giveaway for your server :pensive:",
            color: 'RED'
        }],
        ephemeral: true
    });
    const all = onServer.sort((a, b) => b.startAt - a.startAt);
    let list = [];
    all.forEach((giveaway) => list.push(!giveaway.ended ?
        `${giveaway.hostedBy} • **${giveaway.prize}** | ends in: <t:${Math.floor(giveaway.endAt / 1000)}:R> | ${embedURL('Jump to giveaway', giveaway.messageURL)} (message ID: \`${giveaway.messageId})\`` :
        `**ENDED** ${giveaway.hostedBy} • **${giveaway.prize}** | ${embedURL('Jump to giveaway', giveaway.messageURL)} (message ID: \`${giveaway.messageId}\``));

    const embed = new MessageEmbed()
        .setDescription(list.join('\n'))
        .setAuthor(`giveaway list for ${interaction.guild.name}`, interaction.guild.iconURL({ size: 4096, dynamic: true }))
        .setTimestamp()
        .setFooter(`${onServer.filter(g => !g.ended).length} ongoing giveaway`)

    return interaction.reply({ embeds: [embed] });
};