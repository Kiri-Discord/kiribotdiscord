const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
    const off = interaction.options.getBoolean('disable');
    const db = client.guildsStorage.get(interaction.guild.id);
    if (off) {
        await interaction.deferReply();
        db.logChannelID = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            logChannelID: null
        })
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ mod logs has been disabled` }] });
    };
    const channel = interaction.options.getChannel('channel');
    if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [{ color: "#bee7f7", description: `the moderation logs channel must be a text channel dear :pensive:` }], ephemeral: true });

    if (!channel.permissionsFor(interaction.guild.me).has('MANAGE_WEBHOOKS')) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send logs to ${channel}!\nplease allow the permission \`MANAGE_WEBHOOKS\` for me before trying again.` }], ephemeral: true });
    db.logChannelID = channel.id;
    await interaction.deferReply();
    await client.dbguilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        logChannelID: channel.id
    });
    return interaction.editReply(({ embeds: [{ color: "#bee7f7", description: `☑️ the mod logs channel has been set to ${channel}!` }] }));
}

exports.help = {
    name: "setmodlogs",
    description: "set the logs channel where i will logs moderation action",
    usage: ["setmodlogs `<#channel>`", "setmodlogs `off`"],
    example: ["setmodlogs `#logs`", "setmodlogs `off`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addChannelOption(option => option
            .setRequired(true)
            .setName('channel')
            .setDescription('what is the channel that you want logs to be sent to?')
            .addChannelType(ChannelType.GuildText)
        )
        .addBooleanOption(option => option
            .setName('disable')
            .setDescription('weather you want or not to disable the moderation log')
            .setRequired(false)),
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"],
};