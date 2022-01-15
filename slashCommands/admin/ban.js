const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user');
    const guildDB = client.guildsStorage.get(interaction.guild.id);

    const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);

    if (!member.bannable) return interaction.reply({ embeds: [{ color: "RED", description: 'this user can\'t be banned. it\'s either because they are a mod/admin, or their highest role is equal or higher than mine 😔' }], ephemeral: true });

    if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [{ color: "RED", description: 'you cannot ban someone with a higher role than you!' }], ephemeral: true });
    const reason = interaction.options.getString('reason') || 'No reason specified';
    const banembed = new MessageEmbed()
        .setDescription(`🔨 i banned **${member.user.tag}** with reason **${reason}**!`)
        .setColor("#ff0000")
    const logembed = new MessageEmbed()
        .setColor(15158332)
        .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setTitle('User banned')
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Username', member.user.username)
        .addField('User ID', member.id)
        .addField('Moderator', interaction.user.toString())
        .setFooter({text: 'Banned at'})
        .addField('Reason', reason)
        .setTimestamp()

    try {
        await interaction.deferReply();
        if (!member.user.bot) member.send(`🔨 you were \`banned\` from **${interaction.guild.name}** \n**reason**: ${reason}`);
        await member.ban({ reason });
        await interaction.editReply({ embeds: [banembed] });
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
        if (interaction.deferred) return interaction.editReply({ embeds: [{ color: "RED", description: `sorry, an error happened when i tried to ban that user. can you try again later?` }], ephemeral: true });
        else return interaction.reply({ embeds: [{ color: "RED", description: `sorry, an error happened when i tried to ban that user. can you try again later?` }], ephemeral: true });
    };
};


exports.help = {
    name: "ban",
    description: "ban someone from the server",
    usage: ["ban `<@user> [reason]`", "ban `<@user>`"],
    example: ["ban `@Bell because it has to be`", "ban `@kuru`"]
};

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(true)
            .setDescription('which member would you like to ban?')
        )
        .addStringOption(option => option
            .setName('reason')
            .setRequired(false)
            .setDescription('why are you doing this?')),
    userPerms: ["BAN_MEMBERS"],
    clientPerms: ["BAN_MEMBERS"],
    channelPerms: ["EMBED_LINKS"]
};