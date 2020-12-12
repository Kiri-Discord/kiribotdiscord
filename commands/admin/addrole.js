const { MessageEmbed } = require('discord.js');


exports.run = async (client, message, args) => {


    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const roleName = args.slice(1).join(' ');

    if (!member || !roleName) return message.reply("incorrect usage bruh, it's \`<username || user id> <role name || id>\`").then(m => m.delete({ timeout: 5000 }))

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));
    
    if (!role) return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));

    if (role.name === "@everyone") return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));
    if (role.name === "@here") return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));

    const alreadyHasRole = member._roles.includes(role.id);

    if (alreadyHasRole) return message.reply('that user already has that role!').then(m => m.delete({ timeout: 5000 }));

    const embed = new MessageEmbed()
    .setDescription(`☑️ i have successfully given the role \`${role.name}\` to **${member.user.tag}**`)
    .setColor('f3f3f3')

    member.roles.add(role).then(() => message.channel.send(embed)).then(() => {
        if (!logChannel) {
            return
        } else {
            return logChannel.send(rolelog);
        }
    }).catch(err => {
        message.reply("ouch, i bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.");
    });

    const rolelog = new MessageEmbed()
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setDescription(`Role added to ${member.user.tag}`)
    .setThumbnail(member.user.avatarURL())
    .addField('Role added', role.name)
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Moderator', message.author)

};

exports.help = {
    name: "addrole",
    description: "give someone a role",
    usage: ["addrole `<@user> <@role>`", "addrole `<@user> <role ID>`", "addrole `<user ID> <role ID>`", "addrole `<user ID> <@role>`", "addrole `<@user> <role name>`", "addrole `<user ID> <role name>"],
    example: ["addrole `@bach @pvp`", "addrole `@kuru 584484488877`", "addrole `5575557852 Member`"]
};
  
exports.conf = {
    aliases: ["add-role", "give-role"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_ROLES"],
	clientPerms: ["MANAGE_ROLES", "SEND_MESSAGES", "EMBED_LINKS"]
};
  
