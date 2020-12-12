const { MessageEmbed } = require('discord.js');


exports.run = async (client, message, args) => {


    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(`You do not have \`MANAGE_ROLES\` permission to use this command 😔`).then(m => m.delete({ timeout: 5000 }));

    if (!args[0] || !args[1]) return message.reply("incorrect usage bruh, it's \`<username || user id> <role name || id>\`").then(m => m.delete({ timeout: 5000 }))

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const roleName = args.slice(1).join(' ');

    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));
    
    if (!role) return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));

    if (role.name === "@everyone") return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));
    if (role.name === "@here") return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));

    const alreadyHasRole = member._roles.includes(role.id);

    if (!alreadyHasRole) return message.reply('that user doesn\'t has that role!').then(m => m.delete({ timeout: 5000 }));

    const embed = new MessageEmbed()
    .setDescription(`☑️ i have successfully removed the role \`${role.name}\` from **${member.user.tag}**`)
    .setColor('f3f3f3')

    member.roles.remove(role).then(() => message.channel.send(embed)).then(() => {
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
    .setDescription(`Role removed from ${member.user.tag}`)
    .setThumbnail(member.user.avatarURL())
    .addField('Role removed', role.name)
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Moderator', message.author)

};

exports.help = {
    name: "removerole",
    description: "take away a role from someone",
    usage: ["removerole `<@user> <@role>`", "removerole `<@user> <role ID>`", "removerole `<user ID> <role ID>`", "removerole `<user ID> <@role>`", "removerole `<@user> <role name>`", "removerole `<user ID> <role name>"],
    example: ["removerole `@bach @pvp`", "removerole `@kuru 584484488877`", "removerole `5575557852 Member`"]
};
  
exports.conf = {
    aliases: ["deleterole", "delrole"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: []
};