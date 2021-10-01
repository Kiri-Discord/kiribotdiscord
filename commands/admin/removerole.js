const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args, prefix) => {
    const guildDB = client.guildsStorage.get(message.guild.id);
    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const member = await getMemberfromMention(args[0], message.guild);

    const roleName = args.slice(1).join(' ');

    if (!member || !roleName) return message.channel.send({ embeds: [{ color: "RED", description: `sorry that was an incorrect usage :pensive: it's \`${prefix}removerole <@user> <@role>\`` }] });

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.channel.send({ embeds: [{ color: "RED", description: `no valid role was provided :pensive: i can only accept role mention, role name and role ID` }] })

    if (role.name === "@everyone") return message.channel.send({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }] });
    if (role.name === "@here") return message.channel.send({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }] });

    if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= role.position) return message.channel.send({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }] });
    if (message.guild.me.roles.highest.position <= role.position) return message.reply({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }] });

    if (!member.manageable) return message.reply({ embeds: [{ color: "RED", description: `i can't remove role from that user! they may either be an admin, or their roles are way higher than me.` }] });

    const alreadyHasRole = member._roles.includes(role.id);

    if (!alreadyHasRole) return message.reply({ embeds: [{ color: "RED", description: `that user doesn't has that role!` }] });

    const embed = new MessageEmbed()
        .setDescription(`☑️ i have successfully removed the role \`${role.name}\` from **${member.user.tag}**`)
        .setColor('f3f3f3')

    const rolelog = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(`Role removed from ${member.user}`)
        .setThumbnail(member.user.avatarURL())
        .addField('Role added', role.name)
        .addField('User', member.user.toString())
        .addField('Moderator', message.author.toString())
        .setTimestamp()
    try {
        await member.roles.remove(role);
        await message.channel.send({ embeds: [embed] });
        if (!logChannel) {
            return
        } else {
            const instance = new sendHook(client, logChannel, {
                username: message.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [rolelog],
            })
            return instance.send();
        }
    } catch (error) {
        return message.reply({ embeds: [{ color: "RED", description: "ouch, i bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me." }] });
    }

};

exports.help = {
    name: "removerole",
    description: "confiscate a certain role from a certain member.",
    usage: ["removerole `<@user> <@role>`", "removerole `<@user> <role ID>`", "removerole `<user ID> <role ID>`", "removerole `<user ID> <@role>`", "removerole `<@user> <role name>`", "removerole `<user ID> <role name>"],
    example: ["removerole `@bach @pvp`", "removerole `@kuru 584484488877`", "removerole `5575557852 Member`"]
};

exports.conf = {
    aliases: ["deleterole", "delrole"],
    cooldown: 4,
    guildOnly: true,
    userPerms: ["MANAGE_ROLES"],
    clientPerms: ["MANAGE_ROLES"],
    channelPerms: ["EMBED_LINKS"]
};