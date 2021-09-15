const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args, prefix) => {
    const guildDB = client.guildsStorage.get(message.guild.id);
    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const member = await getMemberfromMention(args[0], message.guild);

    const roleName = args.slice(1).join(' ');

    if (!member || !roleName) return message.channel.send({ embed: { color: "RED", description: `sorry that was an incorrect usage :pensive: it's \`${prefix}addrole <@user || user ID> <role name || role ID>\`` } });

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.channel.send({ embed: { color: "RED", description: `no valid role was provided :pensive: i can only accept role mention, role name and role ID` } })

    if (role.name === "@everyone") return message.channel.send({ embed: { color: "RED", description: `\`@everyone\` is not a valid role!` } });
    if (role.name === "@here") return message.channel.send({ embed: { color: "RED", description: `\`@here\` is not a valid role!` } });

    if (!message.member.hasPermission('ADMINISTRATOR')) {
        if (message.member.roles.highest.position <= role.position) return message.channel.send({ embed: { color: "RED", description: `that role is higher or equal your highest role!` } });
        if (message.guild.me.roles.highest.position <= role.position) return message.inlineReply({ embed: { color: "RED", description: `that role is higher or equal my highest role!` } });
    };


    const alreadyHasRole = member._roles.includes(role.id);

    if (alreadyHasRole) return message.inlineReply({ embed: { color: "RED", description: `that user already has that role!` } });

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
            const instance = new sendHook(client, logChannel, {
                username: message.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [rolelog],
            })
            return instance.send();
        }
    } catch (error) {
        return message.inlineReply("ouch, i bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.");
    }
};

exports.help = {
    name: "addrole",
    description: "Add a certain role to a certain person.",
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