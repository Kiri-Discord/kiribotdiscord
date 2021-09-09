const { MessageEmbed } = require('discord.js')
const moment = require('moment');
const { trimArray } = require('../../util/util');


exports.run = async(client, message, args) => {

    let mention = await getMemberfromMention(args[0], message.guild) || message.member;

    if (mention.user.presence.status === "dnd") mention.user.presence.status = "Do not disturb";
    if (mention.user.presence.status === "idle") mention.user.presence.status = "Idle";
    if (mention.user.presence.status === "offline") mention.user.presence.status = "Offline";
    if (mention.user.presence.status === "online") mention.user.presence.status = "Online";

    function game() {
        let game;
        if (mention.user.presence.activities.length >= 1) {
            if (mention.user.presence.activities[0].type === "CUSTOM_STATUS") {
                game = "That user is displaying a custom status!"
            } else {
                game = `${mention.user.presence.activities[0].type} ${mention.user.presence.activities[0].name}`
            }
        } else if (mention.user.presence.activities.length < 1) {
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
        EARLY_VERIFIED_DEVELOPER: `${devVerified} Early Verified Bot Developer`
    };
    const deprecated = ['DISCORD_PARTNER', 'VERIFIED_DEVELOPER'];

    const userFlags = mention.user.flags ? mention.user.flags.toArray().filter(flag => !deprecated.includes(flag)) : [];

    let x = Date.now() - mention.user.createdAt;
    let y = Date.now() - mention.joinedAt;
    let created = Math.floor(x / 86400000);
    let joined = Math.floor(y / 86400000);

    const member = message.guild.member(mention);
    let highestrole = member.roles.highest !== undefined && member.roles.highest !== null ? member.roles.highest : "None";
    let roles = member.roles.cache
        .filter(role => role.id !== highestrole.id)
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString());
    let nickname = member.nickname !== undefined && member.nickname !== null ? member.nickname : "None";
    let createdate = moment.utc(mention.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss");
    let joindate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss");
    let status = mention.user.presence.status;
    let avatar = mention.user.displayAvatarURL({ size: 4096, dynamic: true });
    let dots;
    if (roles.length) {
        if (roles.length > 6) dots = '...';
        else dots = ''
    } else dots = '';
    const embed = new MessageEmbed()
        .setDescription(mention.user.toString())
        .setAuthor(mention.user.tag, avatar)
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(avatar)
        .setTimestamp()
        .setColor(mention.displayHexColor)
        .addField("\`👑\` Highest role", highestrole, true)
        .addField("\`ℹ️\` ID", `\`${mention.user.id}\``, true)
        .addField("\`💬\` Nickname", nickname, true)
        .addField("📅\` Account creation date", `${createdate} \nsince ${created} day(s) ago`, true)
        .addField("\`➡️\` Guild join date", `${joindate} \nsince ${joined} day(s) ago`, true)
        .addField('\`🤖\` Bot?', mention.user.bot ? 'True' : 'False', true)
        .addField("\`👀\` Status", status, true)
        .addField('\`⛳\` Flags', userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None')
        .addField("\`🎮\` Activity", game(), true)
        .addField(`\`👤\` Roles [${roles.length}]`, roles.length ? trimArray(roles, 6).join(', ') + dots : 'None');

    return message.channel.send({ embeds: [embed] });
}

exports.help = {
    name: "user-info",
    description: "fetch an user's information on the guild. if no user is given, your own information will be displayed.",
    usage: "user-info `[@user]`",
    example: "user-info `@Bell`"
}

exports.conf = {
    aliases: ["userinfo", "whois", 'user'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}