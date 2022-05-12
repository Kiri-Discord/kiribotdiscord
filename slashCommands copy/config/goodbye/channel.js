const { MessageEmbed } = require('discord.js');

exports.run = async(client, interaction, db) => {
    const channel = interaction.options.getChannel('destination');
    if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you can only send goodbye message to a text channel dear :pensive:` }], ephemeral: true });
    if (!channel.viewable || !channel.permissionsFor(interaction.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send goodbye message to ${channel}!\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.` }], ephemeral: true });

    await interaction.deferReply();
    db.byeChannelID = channel.id;

    const storageAfter = await client.db.guilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        byeChannelID: channel.id
    });
    const note = storageAfter.byeContent.content === '{auto}' ? `a default goodbye message has been set because you haven't set a custom one yet. to use your own your custom goodbye message, do \`/setgoodbye content\`!` : '';
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setDescription(`☑️ the goodbye feature has been set to ${channel}!\n${note}`)
        .setFooter({text: `the "${storageAfter.responseType}" response type has been set for all default upcoming greeting message.`})
    return interaction.editReply({ embeds: [embed] });
};