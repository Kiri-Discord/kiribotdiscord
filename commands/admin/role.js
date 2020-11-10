const Guild = require('../../model/guild');
const { MessageEmbed } = require('discord.js');


exports.run = async (client, message, args) => {


    const guildDB = await Guild.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(`You do not have \`Manage Roles\` permission to use this command 😔`).then(m => m.delete({ timeout: 5000 }));

    if (!args[0] || !args[1]) return message.channel.send("Incorrect usage, It's `<username || user id> <role name || id>").then(m => m.delete({ timeout: 5000 }))

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const roleName = message.guild.roles.cache.find(r => (r.name === args[1].toString()) || (r.id === args[1].toString().replace(/[^\w\s]/gi, '')));

    const alreadyHasRole = member._roles.includes(roleName.id);

    if (alreadyHasRole) return message.channel.send('that user already has that role!').then(m => m.delete({ timeout: 5000 }));

    const embed = new MessageEmbed()
    .setDescription(`➕ Moderator **${message.author.tag}** has successfully given the role **${roleName.name}** to **${member.user.tag}**`)
    .setColor('f3f3f3')

    member.roles.add(roleName).then(() => message.channel.send(embed)).catch(err => {
        console.error(err);
        message.channel.send("Ouch, i bumped by an error :( Can you check the role ID or my perms? That user also might have a higher role than me or the role that you are trying to give that user is higher than me.");
    });

    const rolelog = new MessageEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL())
    .setTitle(`Role added to ${member.user.tag}`)
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Moderator', message.author)

    if (!logChannel) {
        return
    } else {
 

        return logChannel.send(rolelog);

    };

    


    
};

exports.help = {
    name: "role",
    description: "i will give someone a role when you run this",
    usage: `role <@user> <@role>`,
    example: `role @bach @pvp`
  }
  
  exports.conf = {
    aliases: ["role", "give-role"],
    cooldown: 5
  }
  