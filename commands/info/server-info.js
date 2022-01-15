const { MessageEmbed } = require('discord.js');
const { trimArray } = require('../../util/util');

exports.run = async(client, message, args) => {
        const { guild } = message;
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
            .setColor(message.member.displayHexColor)
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
        .addField(`\`🔥\` Roles [${roles.length}]`, roles.length ? trimArray(roles, 5).join(', ') + dots : 'None')
    return message.channel.send({ embeds: [embed] });
};

exports.help = {
    name: "server-info",
    description: "fetch the server's information",
    usage: ["server-info"],
    example: ["server-info"]
};

exports.conf = {
    aliases: ["serverinfo", "guildinfo", 'server'],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};