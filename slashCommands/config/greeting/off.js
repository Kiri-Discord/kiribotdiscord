const { MessageEmbed } = require('discord.js');
exports.run = async(client, interaction, db) => {
    await interaction.deferReply();
    db.greetChannelID = undefined;
    await client.dbguilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        greetChannelID: null
    });
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setDescription(`❌ greeting feature has been disabled`);
    return interaction.editReply({ embeds: [embed] });
};