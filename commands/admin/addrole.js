const { MessageEmbed } = require('discord.js');


exports.run = async(client, message, args, prefix) => {
    const guildDB = client.guildsStorage.get(message.guild.id);
    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const member = await getMemberfromMention(args[0], message.guild);

    const roleName = args.slice(1).join(' ');

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';

    if (!member || !roleName) return message.inlineReply(`incorrect usage bruh, it's \`${prefix}addrole <username || user id> <role name || id>\`!`);

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.inlineReply(`p l e a s e provide a vaild role name, mention or id for me to add pls ${sedEmoji}`)

    if (role.name === "@everyone") return message.inlineReply(`\`@everyone\` is a default role ${sedEmoji}`);
    if (role.name === "@here") return message.inlineReply(`\`@here\` is not a role ${sedEmoji}`);





    if (message.member.roles.highest.position < role.position) return message.inlineReply('that role is higher than your highest role! :pensive:');
    if (message.member.roles.highest.position < member.roles.highest.position) return message.inlineReply('that user has a role equal or higher than yours :pensive:');
    if (message.guild.me.roles.highest.position < role.position) return message.inlineReply('that role is equal or higher than me :pensive:');
    if (message.guild.me.roles.highest.position < member.roles.highest.position) return message.inlineReply('that user has a role equal or higher than me :pensive:');


    const alreadyHasRole = member._roles.includes(role.id);

    if (alreadyHasRole) return message.inlineReply('that user already has that role!');

    const embed = new MessageEmbed()
        .setDescription(`☑️ i have successfully given the role \`${role.name}\` to **${member.user.tag}**`)
        .setColor('f3f3f3')

    const rolelog = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(`Role added to ${member.user}`)
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Role added', role)
        .addField('Username', member.user.username)
        .addField('User ID', member.id)
        .addField('Moderator', message.author)
        .setTimestamp()
    try {
        await member.roles.add(role);
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
    name: "addrole",
    description: "give someone a role",
    usage: ["addrole `<@user> <@role>`", "addrole `<@user> <role ID>`", "addrole `<user ID> <role ID>`", "addrole `<user ID> <@role>`", "addrole `<@user> <role name>`", "addrole `<user ID> <role name>"],
    example: ["addrole `@bach @pvp`", "addrole `@kuru 584484488877`", "addrole `5575557852 Member`"]
};

exports.conf = {
    aliases: ["add-role", "give-role"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_ROLES"],
    clientPerms: ["MANAGE_ROLES"],
    channelPerms: ["EMBED_LINKS"]
};