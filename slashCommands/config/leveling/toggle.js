exports.run = async(client, interaction, db) => {
    const enable = interaction.options.getString('toggle') === 'on' ? true : false;
    await interaction.deferReply();
    db.enableLevelings = enable;
    await client.dbguilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        enableLevelings: enable
    });
    return interaction.editReply({ embeds: [{ color: "#bee7f7", description: enable ? `☑️ levelings has been enabled` : `❌ levelings has been disabled` }] });
};