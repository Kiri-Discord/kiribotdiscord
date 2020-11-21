const { MessageEmbed } = require('discord.js');


exports.run = async (client, message, args) => {


    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(`You do not have \`Manage Roles\` permission to use this command 😔`).then(m => m.delete({ timeout: 5000 }));

    if (!args[0] || !args[1]) return message.reply("incorrect usage bruh, it's \`<username || user id> <role name || id>\`").then(m => m.delete({ timeout: 5000 }))

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const roleName = message.guild.roles.cache.find(r => (r.name === args[1].toString()) || (r.id === args[1].toString().replace(/[^\w\s]/gi, '')));

    if (!roleName) return message.reply('p l e a s e provide a vaild role for me to add pls').then(m => m.delete({ timeout: 5000 }));

    const alreadyHasRole = member._roles.includes(roleName.id);

    if (alreadyHasRole) return message.reply('that user already has that role!').then(m => m.delete({ timeout: 5000 }));

    const embed = new MessageEmbed()
    .setDescription(`☑️ successfully given the role **${roleName.name}** to **${member.user.tag}**`)
    .setColor('f3f3f3')

    member.roles.add(roleName).then(() => message.channel.send(embed)).then(() => {
        if (!logChannel) {
            return
        } else {
            return logChannel.send(rolelog);
        }
    }).catch(err => {
        message.reply("ouch, i bumped by an error :( can you check the role ID or my perms? that user also might have a higher role than me or the role that you are trying to give that user is higher than me.");
    });

    const rolelog = new MessageEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL())
    .setTitle(`Role added to ${member.user.tag}`)
    .setThumbnail(member.user.avatarURL())
    .addField('Role added', roleName.name)
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Moderator', message.author)



    
};

exports.help = {
    name: "addrole",
    description: "i will give someone a role when you run this",
    usage: `addrole <@user> <@role>`,
    example: `addrole @bach @pvp`
};
  
exports.conf = {
    aliases: ["add-role", "give-role"],
    cooldown: 5
};
  
