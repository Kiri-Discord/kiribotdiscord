exports.run = async(client, interaction, db) => {
    const there = interaction.options.getString('there') === 'on' ? true : false;
    if (there) {
        await interaction.deferReply();
        const setting = await client.dbguilds.findOne({
            guildID: interaction.guild.id
        });
        db.levelings.destination = null;
        setting.levelings.destination = null;
        await setting.save();
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `☑️ levelings announcement will now be send in the same channel that the user is messaging!` }] });
    };
    const channel = interaction.options.getChannel('destination');
    if (!channel) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you didn't specify a destination channel! an channel is required if you don't set the "there" option to **ON** :pensive:`, footer: { text: 'tip: setting the "there" option force all leveling message to be send in the same channel that the memeber is messaging' } }], ephemeral: true });
    if (!channel.viewable || !channel.permissionsFor(interaction.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send leveling announcement to ${channel}!\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again please :pensive:` }], ephemeral: true });
    await interaction.deferReply();
    const setting = await client.dbguilds.findOne({
        guildID: interaction.guild.id
    });
    db.levelings.destination = channel.id;
    setting.levelings.destination = channel.id;
    await setting.save();
    return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `☑️ levelings announcement will now be send in ${channel}!` }] });
}