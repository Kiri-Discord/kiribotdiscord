exports.run = async(client, interaction, db) => {
    const off = interaction.options.getBoolean('disable');
    if (off) {
        await interaction.deferReply();
        db.ignoreLevelingsChannelID = undefined;
        await client.db.guilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            ignoreLevelingsChannelID: null
        });
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ ignore levelings has been disabled` }] });
    };
    let channel = interaction.options.getChannel('channel');
    if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you can only ignore messages from a text channel dear :pensive:` }], ephemeral: true });
    try {
        db.ignoreLevelingsChannelID = channel.id;
        await client.db.guilds.findOneAndUpdate({
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