const { MessageEmbed } = require('discord.js');
exports.run = async(client, interaction, db) => {
    await interaction.deferReply();
    db.byeChannelID = undefined;
    await client.db.guilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        byeChannelID: null
    });
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setDescription(`❌ goodbye feature has been disabled`);
    return interaction.editReply({ embeds: [embed] });
};