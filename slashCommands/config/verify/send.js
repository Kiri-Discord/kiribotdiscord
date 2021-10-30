const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

exports.run = async(client, interaction, db) => {
    if (!db.verifyChannelID) return interaction.reply({ embeds: [{ color: "RED", description: `you haven't set up the verification feature yet! to setup the verify feature, do \`/verify <#channel> <@role>\`` }], ephemeral: true });
    const channel = interaction.guild.channels.cache.get(db.verifyChannelID);
    if (!channel.viewable || !channel.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `it seems like i don't have the perms to send messages and embed links to ${channel}! can you setup the verification feature again? :pensive:` }], ephemeral: true });
    const role = interaction.guild.roles.cache.get(db.verifyRole);
    if (!role) return interaction.reply({ embeds: [{ color: "RED", description: `the verification role was deleted or invalid! can you setup the verification feature again? :pensive:` }], ephemeral: true })
    const embed = new MessageEmbed()
        .setColor('#cbd4c2')
        .setAuthor(interaction.guild.name, interaction.guild.iconURL({ size: 4096, dynamic: true }))
        .setTitle(`hey, welcome to ${interaction.guild.name}!`)
        .setThumbnail(client.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setDescription(`can you see any channel or chat in our server yet? if you can't, it's probably that the admins here have setup me to provide the verification for you :slight_smile:\nto begin the verification, head to your DM (Direct Message), where i will send your verification link to continue!\n\nthe verification role that you will get is ${role.toString()}`)
        .addField('**did anything wrong happened?**', 'feel free to click on any button below my message here, i will be glad to help!')
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('verify_unsolve_captcha')
            .setLabel("i can't solve the captcha!")
            .setEmoji('⚠️')
            .setStyle('DANGER'),
            new MessageButton()
            .setCustomId('verify_didnt_recieve')
            .setLabel("the DM didn't arrive!")
            .setStyle('SECONDARY')
            .setEmoji('📬'),
            new MessageButton()
            .setCustomId('verify_cant_talk')
            .setLabel("i completed the verification, but i can't talk!")
            .setEmoji('❌')
            .setStyle('PRIMARY'),
        );
    interaction.reply({
        content: '☑️ i have resend the verify guiding message successfully to the verification channel!',
        ephemeral: true
    })
    return channel.send({ embeds: [embed], components: [row] });
};