const varReplace = require('../../../util/variableReplace');

exports.run = async(client, interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    let channel;
    const setting = await client.db.guilds.findOne({
        guildID: interaction.guild.id
    });
    if (!setting.levelings.destination) channel = interaction.channel;
    else channel = interaction.guild.channels.cache.get(setting.levelings.destination);
    if (!channel || !channel.viewable || !channel.permissionsFor(interaction.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
        setting.levelings.destination = null;
        await setting.save();
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: "i don't have the perms to send leveling announcement message to that channel! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.", footer: { text: `the channel for leveling message was also resetted. please set a new one using /leveling channel!` } }] });
    };
    interaction.editReply({ embeds: [{ color: "#bee7f7", description: `✅ your test leveling message was sent!` }] });
    if (setting.levelings.content.type === 'plain') return channel.send(varReplace.replaceText(setting.levelings.content.content, interaction.member, interaction.guild, { event: 'level', type: setting.responseType }, { level: 50, xp: 50 }));
    else return channel.send({ embeds: [varReplace.replaceEmbed(setting.levelings.content.content.embed, interaction.member, interaction.guild, { event: 'level', type: setting.responseType }, { level: 50, xp: 50 })] });
};