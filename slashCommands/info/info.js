const { MessageEmbed } = require('discord.js');
const { trimArray } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');
const permissions = require('../../assets//permission.json');

exports.run = async(client, interaction) => {
        if (interaction.options.getSubcommand() === 'server') {
            const { guild } = interaction;
            let icon = guild.iconURL({ size: 4096, dynamic: true });

            let filterLevels = {
                DISABLED: 'Off',
                MEMBERS_WITHOUT_ROLES: 'No role',
                ALL_MEMBERS: 'Everyone'
            };
            let verificationLevels = {
                NONE: 'None',
                LOW: 'Low',
                MEDIUM: 'Medium',
                HIGH: 'High',
                VERY_HIGH: 'Highest'
            };
            let roles = guild.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString());
            let nitroEmoji = client.customEmojis.get('nitro_badge');
            const { presences } = guild;

            let offline = presences.cache.filter(m => m.status === "offline").size;
            let online = presences.cache.filter(m => m.status === "online").size;
            let idle = presences.cache.filter(m => m.status === "idle").size;
            let dnd = presences.cache.filter(m => m.status === "dnd").size;
            let robot = guild.members.cache.filter(m => m.user.bot).size;

            let total = guild.memberCount;
            let channels = guild.channels;
            let text = channels.cache.filter(r => r.type === "GUILD_TEXT").size,
                vc = channels.cache.filter(r => r.type === "GUILD_VOICE").size,
                category = channels.cache.filter(r => r.type === "GUILD_CATEGORY").size,
                totalchan = text + vc;
            let h = `<t:${Math.floor(guild.createdAt.getTime()/1000)}:R>`
            let created = `<t:${Math.floor(guild.createdAt.getTime()/1000)}:F>`;
            let dots;
            if (roles.length) {
                if (roles.length > 5) dots = '...';
                else dots = ''
            } else dots = '';
            const embed = new MessageEmbed()
                .setColor(interaction.member.displayHexColor)
                .setTimestamp(new Date())
                .setThumbnail(icon)
                .setAuthor({name: `Information for ${guild.name}:`, iconURL: client.user.displayAvatarURL()})
                .setDescription(`**ID:** \`${guild.id}\``)
                .addField("\`📅\` Date created", `${created}\n${h}`, true)
                .addField("\`👑\` Owner", `<@${guild.ownerId}>\n\`${guild.ownerId}\``, true)
                .addField(`\`👤\` Members [${total}]`, `Online: ${online} \nIdle: ${idle} \nDND: ${dnd} \nOffline: ${offline} \nBots: ${robot}`, true)
                .addField(`\`💬\` Channels [${totalchan}]`, `Text: ${text} \nVoice: ${vc} \nCategory: ${category}`, true)
                .addField('\`🔞\` Explicit filter', filterLevels[guild.explicitContentFilter], true)
                .addField('\`🔑\` Verification (Discord Server Setting)', verificationLevels[guild.verificationLevel], true)
                .addField(`${nitroEmoji} Boosting`, `Boost count: \`${guild.premiumSubscriptionCount || 0}\`${guild.premiumTier ? ` (Tier ${guild.premiumTier})` : ''}`, true)
            .addField(`\`🔥\` Roles [${roles.length}]`, roles.length ? trimArray(roles, 5).join(', ') + dots : 'None');
        return interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() === 'user') {
        const member = interaction.options.getMember('target') || interaction.member;
        const presences = {
            "dnd": "Do not disturb",
            "idle": "Idle",
            "offline": "Offline",
            "online": "Online"
        };
    
        function game() {
            if (!member.presence) return "None";
            let game;
            if (member.presence.activities.length >= 1) {
                if (member.presence.activities[0].type === "CUSTOM") {
                    game = `That user is displaying a custom status!`
                } else {
                    game = `${member.presence.activities[0].type} ${member.presence.activities[0].name}`
                }
            } else if (member.presence.activities.length < 1) {
                game = "None"
            }
            return game;
        };
        const employee = client.customEmojis.get('staff_badge');
        const partner = client.customEmojis.get('new_partner_badge');
        const bug1 = client.customEmojis.get('bug_hunter_badge1');
        const bug2 = client.customEmojis.get('bug_hunter_badge2');
        const hypesquad = client.customEmojis.get('hypesquad_badge');
        const bravery = client.customEmojis.get('bravery_badge');
        const brilliance = client.customEmojis.get('brilliance_badge');
        const balance = client.customEmojis.get('balance_badge');
        const early = client.customEmojis.get('early_supporter_badge');
        const verified = client.customEmojis.get('verified');
        const devVerified = client.customEmojis.get('verified_developer_badge');
        const verifiedMods = client.customEmojis.get('certified_mod');
    
        const flags = {
            DISCORD_EMPLOYEE: `${employee} Discord Employee`,
            PARTNERED_SERVER_OWNER: `${partner} Discord Partner`,
            BUGHUNTER_LEVEL_1: `${bug1} Bug Hunter Level 1`,
            BUGHUNTER_LEVEL_2: `${bug2} Bug Hunter Level 2`,
            HYPESQUAD_EVENTS: `${hypesquad} HypeSquad Events`,
            HOUSE_BRAVERY: `${bravery} House of Bravery`,
            HOUSE_BRILLIANCE: `${brilliance} House of Brilliance`,
            HOUSE_BALANCE: `${balance} House of Balance`,
            EARLY_SUPPORTER: `${early} Early Supporter`,
            TEAM_USER: `Team User`,
            SYSTEM: `System`,
            VERIFIED_BOT: `${verified} Verified Bot`,
            EARLY_VERIFIED_DEVELOPER: `${devVerified} Early Verified Bot Developer`,
            DISCORD_CERTIFIED_MODERATOR: `${verifiedMods} Certified Discord Moderator`
        };
    
        const userFlags = member.user.flags ? member.user.flags.toArray() : [];
    
        let created = `<t:${Math.floor(member.user.createdAt.getTime()/1000)}:R>`;
        let joined = `<t:${Math.floor(member.joinedAt.getTime()/1000)}:R>`;
    
        let highestrole = member.roles.highest !== undefined && member.roles.highest !== null ? member.roles.highest : "None";
        let roles = member.roles.cache
            .filter(role => role.id !== highestrole.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString());
        let nickname = member.nickname !== undefined && member.nickname !== null ? member.nickname : "None";
    
        let createdate = `<t:${Math.floor(member.user.createdAt.getTime()/1000)}:F>`;
        let joindate = `<t:${Math.floor(member.joinedAt.getTime()/1000)}:F>`;
        let status = presences[member.presence ? member.presence.status || 'offline' : 'offline'];
        let avatar = member.user.displayAvatarURL({ size: 4096, dynamic: true });
        let dots;
        if (roles.length) {
            if (roles.length > 6) dots = '...';
            else dots = ''
        } else dots = '';
        const serialized = member.permissions.serialize();
        const perms = Object.keys(serialized).filter(perm => serialized[perm] && permissions[perm]);
        const embed = new MessageEmbed()
            .setDescription(member.user.toString())
            .setAuthor({name: member.user.tag, iconURL: avatar})
            .setThumbnail(avatar)
            .setTimestamp()
            .setColor(member.displayHexColor)
            .addField("\`👑\` Highest role", highestrole.toString(), true)
            .addField("\`ℹ️\` ID", `\`${member.user.id}\``, true)
            .addField("\`💬\` Nickname", nickname, true)
            .addField("\`📅\` Account creation date", `${createdate}\n${created}`, true)
            .addField("\`➡️\` Guild join date", `${joindate}\n${joined}`, true)
            .addField('\`🤖\` Bot?', member.user.bot ? 'True' : 'False', true)
            .addField("\`👀\` Status", status, true)
            .addField("\`🎮\` Activity", game(), true)
            .addField(`\`🔒\` Key permissions`, perms.map(perm => permissions[perm]).join(', ') || 'None')
            .addField('\`⛳\` Flags', userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None')
            .addField(`\`👤\` Roles [${roles.length}]`, roles.length ? trimArray(roles, 6).join(', ') + dots : 'None')
        return interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() === 'role') {
        const role = interaction.options.getRole('role')
    
        if (role.name === "@everyone") return interaction.reply({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }], ephemeral: true });
        if (role.name === "@here") return interaction.reply({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }], ephemeral: true });
    
        const serialized = role.permissions.serialize();
        const perms = Object.keys(permissions).filter(perm => serialized[perm]);
        const embed = new MessageEmbed()
            .setThumbnail(role.iconURL({ size: 512 }))
            .setColor(role.hexColor)
            .setAuthor({ name: `"${role.name}" role information:`, iconURL: client.user.displayAvatarURL() })
            .setDescription(role.toString())
            .addField('\`📖\` Name', role.name, true)
            .addField('\`🆔\` ID', role.id, true)
            .addField('\`🎨\` Color hex', role.hexColor.toUpperCase(), true)
            .addField('\`📆\` Creation date', `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, true)
            .addField('\`🧑‍🤝‍🧑\` Seperated in member list?', role.hoist ? 'Yes' : 'No', true)
            .addField('**@** Mentionable?', role.mentionable ? 'Yes' : 'No', true)
            .addField('\`🔒\` Key permission', perms.map(perm => permissions[perm]).join(', ') || 'None')
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }
};

exports.help = {
    name: "info",
    description: "fetch the server, a specific user's information or a role's information",
    usage: ["info server", "info user `<@Member>`", "info role `<@Role>`"],
    example: ["info server", "info user `@Wumpus`", "info role `@Admin`"],
};

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription("fetch a role's detailed information on the guild")
                .addRoleOption(option => option
                    .setName('role')
                    .setRequired(true)
                    .setDescription('which role that you want to get information about? :)')
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('get info about an user in your server')
                .addUserOption(option => option
                    .setName('target')
                    .setDescription('which user that you want to get information about? :)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('get info about this server')),
    channelPerms: ["EMBED_LINKS"]
};