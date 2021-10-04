const { MessageEmbed } = require('discord.js');

exports.run = async(client, interaction, db) => {
    const channel = interaction.options.getChannel('destination');
    if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you can only send greetings message to a text channel dear :pensive:` }], ephemeral: true });
    if (!channel.permissionsFor(interaction.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send greetings message to ${channel}!\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.` }], ephemeral: true });

    await interaction.deferReply();
    db.greetChannelID = channel.id;

    const storageAfter = await client.dbguilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        greetChannelID: channel.id
    });
    const note = storageAfter.greetContent.content === '{auto}' ? `a default greetings message has been set because you haven't set a custom one yet. to use your own your custom greetings message, do \`/setgreetings content\`!` : '';
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setDescription(`☑️ the greetings feature has been set to ${channel}!\n${note}`)
        .setFooter(`the "${storageAfter.responseType}" response type has been set for all default upcoming greeting message.`)
    return interaction.editReply({ embeds: [embed] });
};