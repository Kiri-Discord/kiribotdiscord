const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user');

    const guildDB = client.guildsStorage.get(interaction.guild.id);
    const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);

    if (!member.kickable) return interaction.reply({ embeds: [{ color: "RED", description: 'this user can\'t be kicked. it\'s either because they are a mod/admin, or their highest role is equal or higher than mine 😔' }], ephemeral: true });

    if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [{ color: "RED", description: 'you cannot kick someone with a higher or equal role!' }], ephemeral: true });

    const reason = interaction.options.getString('reason') || 'No reason specified';
    const kickembed = new MessageEmbed()
        .setDescription(`🔨 i kicked **${member.user.tag}** for reason **${reason}**!`)
        .setColor("#ff0000")

    const logembed = new MessageEmbed()
        .setColor(15158332)
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setTitle('User kicked')
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Username', member.user.username)
        .addField('User ID', member.id)
        .addField('Moderator', interaction.user.toString())
        .addField('Reason', reason)
        .setFooter('Kicked at')
        .setTimestamp()

    try {
        await interaction.deferReply();
        if (!member.user.bot) member.send(`🔨 you were \`kicked\` from **${interaction.guild.name}** \n**reason**: ${reason}`);
        await member.kick(reason);
        await interaction.editReply({ embeds: [kickembed] });
        if (!logChannel) {
            return;
        } else {
            const instance = new sendHook(client, logChannel, {
                username: interaction.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [logembed],
            })
            return instance.send();
        };
    } catch (error) {
        if (interaction.deferred) return interaction.editReply({ embeds: [{ color: "RED", description: `an error happened when i tried to kick that user! can you try again later :pensive:` }], ephemeral: true })
        else return interaction.reply({ embeds: [{ color: "RED", description: `an error happened when i tried to kick that user! can you try again later :pensive:` }], ephemeral: true })
    };
};


exports.help = {
    name: "kick",
    description: "kick someone from the server",
    usage: ["kick `<@user> [reason]`", "kick `<@user>`"],
    example: ["kick `@Bell because it has to be`", "kick `@kuru`"]
}

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(true)
            .setDescription('which member would you like to kick?')
        )
        .addStringOption(option => option
            .setName('reason')
            .setRequired(false)
            .setDescription('why are you doing this?')),
    guild: true,
    userPerms: ["KICK_MEMBERS"],
    clientPerms: ["KICK_MEMBERS"],
    channelPerms: ["EMBED_LINKS"]
}