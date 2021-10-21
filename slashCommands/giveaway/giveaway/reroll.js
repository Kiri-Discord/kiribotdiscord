const { Permissions } = require('discord.js');

exports.run = async(client, interaction) => {
    const messageId = interaction.options.getString('message-id');
    if (!messageId) {
        const onChannel = client.giveaways.giveaways
            .filter(g => g.channelId === interaction.channel.id);
        if (!onChannel || !onChannel.length) return interaction.reply({
            embeds: [{
                description: `:boom: there isn't any ongoing giveaway on this channel :pensive:\nuse \`/giveaway list\` to get the remaining giveaways on this server, then run this command again with the message ID of that giveaway by \`/giveaway reroll <message ID>\` :grin:`,
                color: 'RED'
            }],
            ephemeral: true
        })
        const matches = onChannel.sort((a, b) => b.startAt - a.startAt);

        const firstGiveaway = matches[0];
        if (firstGiveaway.extraData.hostedByID !== interaction.user.id && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
            embeds: [{
                description: 'that isn\'t your giveaway, or you don\'t have the \`ADMINISTRATOR\` permission to take full control over that giveaway :pensive:',
                color: 'RED'
            }],
            ephemeral: true
        });
        await interaction.deferReply();
        await client.giveaways.reroll(firstGiveaway.messageId);
        return interaction.editReply({
            embeds: [{
                description: `the giveaway **${firstGiveaway.prize}** was rerolled :tada:`,
                color: 'RED'
            }]
        });
    } else {
        const onServer = client.giveaways.giveaways.filter(g => g.guildId === interaction.guild.id);
        if (!onServer || !onServer.length) return interaction.reply({
            embeds: [{
                description: `:boom: there isn't any ongoing giveaway on the server :pensive:`,
                color: 'RED'
            }],
            ephemeral: true
        });
        const giveaway = onServer.find(g => g.messageId === messageId);
        if (!giveaway) return interaction.reply({
            embeds: [{
                description: "there isn't any giveaway with that message ID :pensive:",
                color: 'RED'
            }],
            ephemeral: true
        });
        if (giveaway.extraData.hostedByID !== interaction.user.id && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
            embeds: [{
                description: 'that isn\'t your giveaway, or you don\'t have the \`ADMINISTRATOR\` permission to take full control over that giveaway :pensive:',
                color: 'RED'
            }],
            ephemeral: true
        });
        await interaction.deferReply();
        await client.giveaways.reroll(giveaway.messageId);
        return interaction.editReply({
            embeds: [{
                description: `the giveaway **${giveaway.prize}** was rerolled :tada:`,
                color: 'RED'
            }]
        });
    };
};