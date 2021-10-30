const varReplace = require('../../../util/variableReplace');
const { MessageEmbed } = require('discord.js');
exports.run = async(client, interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    const setting = await client.dbguilds.findOne({
        guildID: interaction.guild.id
    });
    if (!setting.byeChannelID) {
        const embed = new MessageEmbed()
            .setColor("#bee7f7")
            .setDescription(`❌ the goodbye channel wasn't setup yet!`);
        return interaction.editReply({ embeds: [embed] });
    };
    const channel = interaction.guild.channels.cache.get(setting.byeChannelID);
    if (!channel || !channel.viewable || !channel.permissionsFor(interaction.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
        await client.dbguilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            byeChannelID: null
        });
        db.byeChannelID = undefined;
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: "i don't have the perms to send goodbye message to that channel! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.", footer: { text: `the channel for goodbye message was also resetted. please set a new one using /setgoodbye channel!` } }] });
    };
    interaction.editReply({ embeds: [{ color: "#bee7f7", description: `✅ your test goodbye message was sent!` }] });
    if (setting.byeContent.type === 'plain') return channel.send(varReplace.replaceText(setting.byeContent.content, interaction.member, interaction.guild, { event: 'leave', type: setting.responseType }));
    else return channel.send({ embeds: [varReplace.replaceEmbed(setting.byeContent.content.embed, interaction.member, interaction.guild, { event: 'leave', type: setting.responseType })] });
};