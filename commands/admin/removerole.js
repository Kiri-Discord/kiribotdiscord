const { MessageEmbed } = require('discord.js');


exports.run = async(client, message, args) => {
    const guildDB = client.guildsStorage.get(message.guild.id);
    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const member = await getMemberfromMention(args[0], message.guild);

    const roleName = args.slice(1).join(' ');

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';

    if (!member || !roleName) return message.inlineReply(`incorrect usage bruh, it's \`${prefix}addrole <username || user id> <role name || id>\`!`);

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.inlineReply(`p l e a s e provide a vaild role name, mention or id for me to remove pls ${sedEmoji}`)

    if (role.name === "@everyone") return message.inlineReply(`p l e a s e provide a vaild role name, mention or id for me to add pls ${sedEmoji}`);
    if (role.name === "@here") return message.inlineReply(`p l e a s e provide a vaild role name, mention or id for me to add pls ${sedEmoji}`);

    if (message.member.roles.highest.comparePositionTo(role) < 0 || member.roles.highest.comparePositionTo(message.member.roles.highest) > 0) return message.inlineReply('that role is higher than your highest role! :pensive:');
    if (member.roles.highest.comparePositionTo(message.member.roles.highest) > 0) return message.inlineReply('that user has a role higher than yours :pensive:')

    const alreadyHasRole = member._roles.includes(role.id);

    if (!alreadyHasRole) return message.inlineReply('that user doesn\'t have that role!');

    const embed = new MessageEmbed()
        .setDescription(`☑️ i have successfully removed the role \`${role.name}\` from **${member.user.tag}**`)
        .setColor('f3f3f3')

    const rolelog = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(`Role removed from ${member.user}`)
        .setThumbnail(member.user.avatarURL())
        .addField('Role added', role.name)
        .addField('Username', member.user.username)
        .addField('User ID', member.id)
        .addField('Moderator', message.author)
        .setTimestamp()
    try {
        await member.roles.remove(role);
        await message.channel.send(embed);
        if (!logChannel) {
            return
        } else {
            return logChannel.send(rolelog);
        }
    } catch (error) {
        return message.inlineReply("ouch, i bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.");
    }

};

exports.help = {
    name: "removerole",
    description: "take away a role from someone",
    usage: ["removerole `<@user> <@role>`", "removerole `<@user> <role ID>`", "removerole `<user ID> <role ID>`", "removerole `<user ID> <@role>`", "removerole `<@user> <role name>`", "removerole `<user ID> <role name>"],
    example: ["removerole `@bach @pvp`", "removerole `@kuru 584484488877`", "removerole `5575557852 Member`"]
};

exports.conf = {
    aliases: ["deleterole", "delrole"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_ROLES"],
    clientPerms: ["MANAGE_ROLES"],
    channelPerms: ["EMBED_LINKS"]
};