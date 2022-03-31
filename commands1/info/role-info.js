const { MessageEmbed } = require('discord.js')
const permissions = require('../../assets/permission.json');

exports.run = async(client, message, args, prefix) => {
    const roleName = args.join(' ');
    if (!roleName) return message.channel.send({ embeds: [{ color: "RED", description: `you didn't specify a role mention, role name or role ID :pensive:` }] });

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.channel.send({ embeds: [{ color: "RED", description: `no valid role was provided! i can only accept role mention, role name and role ID :pensive:` }] })

    if (role.name === "@everyone") return message.channel.send({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }] });
    if (role.name === "@here") return message.channel.send({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }] });

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
    return message.channel.send({ embeds: [embed] });
}

exports.help = {
    name: "role-info",
    description: "fetch a role's detailed information on the guild",
    usage: ["role-info `<@Role>`", "role-info `<role ID>`", "role-info `<role name>`"],
    example: ["role-info `@Bell`", "role-info `739058989898989898`", "role-info `Admin`"],
};

exports.conf = {
    aliases: ["role", "roleinfo"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};