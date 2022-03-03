const { MessageEmbed } = require('discord.js')
const { trimArray } = require('../../util/util');
const permissions = require('../../assets//permission.json');
exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0]) || message.member;
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
        .addField(`\`🔒\` Key permission`, perms.map(perm => permissions[perm]).join(', ') || 'None')
        .addField('\`⛳\` Flags', userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None')
        .addField(`\`👤\` Roles [${roles.length}]`, roles.length ? trimArray(roles, 6).join(', ') + dots : 'None')

    return message.channel.send({ embeds: [embed] });
}

exports.help = {
    name: "user-info",
    description: "fetch an user's detailed information on the guild. if no user is given, your own information will be displayed.",
    usage: ["user-info `[@User]`", "user-info `[User ID]`"],
    example: ["user-info `@Bell`", "user-info `123456789012345678`"],
};

exports.conf = {
    aliases: ["userinfo", "whois", 'user'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};