exports.run = async(client, interaction, db) => {
    const off = interaction.options.getBoolean('disable');
    await interaction.deferReply();
    if (off) {
        db.ignoreLevelingsChannelID = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            ignoreLevelingsChannelID: null
        });
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ ignore levelings has been disabled` }] });
    };
    let channel = interaction.options.getChannel('channel');
    try {
        db.ignoreLevelingsChannelID = channel.id;
        await client.dbguilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            ignoreLevelingsChannelID: channel.id
        });
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `☑️ i will ignore levelings from ${channel} starting from now.` }] });
    } catch (err) {
        logger.log('error', err);
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `:x: there was a problem when i was trying to save that! can you try again later?` }] });
    };
};