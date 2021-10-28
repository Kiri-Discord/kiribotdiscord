const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    if (interaction.options.getSubcommand() === 'add') {
        const guildDB = client.guildsStorage.get(interaction.guild.id);
        const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);

        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');

        if (role.name === "@everyone") return interaction.reply({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }], ephemeral: true });
        if (role.name === "@here") return interaction.reply({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }], ephemeral: true });

        if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }], ephemeral: true });

        if (interaction.guild.me.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }], ephemeral: true });

        if (!member.manageable) return interaction.reply({ embeds: [{ color: "RED", description: `i can't add roles to that user! they may either be an admin, or their roles are way higher than me.` }], ephemeral: true });

        const alreadyHasRole = member._roles.includes(role.id);

        if (alreadyHasRole) return interaction.reply({ embeds: [{ color: "RED", description: `that user already has that role!` }], ephemeral: true });

        const embed = new MessageEmbed()
            .setDescription(`☑️ i have successfully given the role \`${role.name}\` to **${member.user.tag}**`)
            .setColor('f3f3f3')

        const rolelog = new MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(`Role added to ${member.user.toString()}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addField('Role added', role.toString())
            .addField('User', member.user.toString())
            .addField('Moderator', interaction.user.toString())
            .setTimestamp()
        try {
            await interaction.deferReply();
            await member.roles.add(role);
            await interaction.editReply({ embeds: [embed] });
            if (!logChannel) {
                return
            } else {
                const instance = new sendHook(client, logChannel, {
                    username: interaction.guild.me.displayName,
                    avatarURL: client.user.displayAvatarURL(),
                    embeds: [rolelog],
                })
                return instance.send();
            };
        } catch (error) {
            if (interaction.deferred) return interaction.editReply({ embeds: [{ color: "RED", description: `ouch, i was bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.` }], ephemeral: true })
            else return interaction.reply({ embeds: [{ color: "RED", description: `ouch, i was bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.` }], ephemeral: true })
        };
    } else if (interaction.options.getSubcommand() === 'remove') {
        const guildDB = client.guildsStorage.get(interaction.guild.id);
        const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);

        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');

        if (role.name === "@everyone") return interaction.reply({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }] });
        if (role.name === "@here") return interaction.reply({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }] });

        if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }], ephemeral: true });
        if (interaction.guild.me.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }], ephemeral: true });

        if (!member.manageable) return interaction.reply({ embeds: [{ color: "RED", description: `i can't remove roles from that user! they may either be an admin, or their roles are way higher than me.` }], ephemeral: true });

        const alreadyHasRole = member._roles.includes(role.id);

        if (!alreadyHasRole) return interaction.reply({ embeds: [{ color: "RED", description: `that user doesn't has that role!` }], ephemeral: true });

        const embed = new MessageEmbed()
            .setDescription(`☑️ i have successfully removed the role \`${role.name}\` from **${member.user.tag}**`)
            .setColor('f3f3f3')

        const rolelog = new MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(`Role removed from ${member.user}`)
            .setThumbnail(member.user.avatarURL())
            .addField('Role added', role.name)
            .addField('User', member.user.toString())
            .addField('Moderator', interaction.user.toString())
            .setTimestamp()
        try {
            await interaction.deferReply();
            await member.roles.remove(role);
            await interaction.editReply({ embeds: [embed] });
            if (!logChannel) {
                return
            } else {
                const instance = new sendHook(client, logChannel, {
                    username: interaction.guild.me.displayName,
                    avatarURL: client.user.displayAvatarURL(),
                    embeds: [rolelog],
                })
                return instance.send();
            }
        } catch (error) {
            if (interaction.deferred) return interaction.editReply({ embeds: [{ color: "RED", description: `ouch, i was bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.` }], ephemeral: true })
            else return interaction.reply({ embeds: [{ color: "RED", description: `ouch, i was bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.` }], ephemeral: true })
        };
    };
};

exports.help = {
    name: "role",
    description: "modify roles for a certain member",
    usage: ["role `add <@user> <@role>`", "role `remove <@user> <@role>`"],
    example: ["role `add @Wumpus @Guest`", "role `remove @Wumpus @member`"]
};

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('add a role to an user')
            .addUserOption(option => option
                .setRequired(true)
                .setName('user')
                .setDescription('what user that you want to modify the role? :)')
            )
            .addRoleOption(option => option
                .setRequired(true)
                .setName('role')
                .setDescription('the role to add')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('remove a role from an user')
            .addUserOption(option => option
                .setRequired(true)
                .setName('user')
                .setDescription('what user that you want to modify the role? :)')
            )
            .addRoleOption(option => option
                .setRequired(true)
                .setName('role')
                .setDescription('the role to remove')
                .setRequired(true)
            )
        ),
    userPerms: ["MANAGE_ROLES"],
    clientPerms: ["MANAGE_ROLES"],
    channelPerms: ["EMBED_LINKS"]
};