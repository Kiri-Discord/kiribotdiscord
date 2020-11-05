const mongoose = require('mongoose');
const Guild = require('../../model/guild');
const Discord = require('discord.js')

exports.run = async (client, message, args) => {

    const member = message.mentions.members.first();

    const guildDB = await Guild.findOne({
        guildID: message.guild.id
    }, async (err, guild) => {
        if (err) console.error(err);
        
        if (!guild) {
            const newGuild = new Guild({
                _id: mongoose.Types.ObjectId(),
                guildID: message.guild.id,
                guildName: message.guild.name,
                prefix: client.config.prefix,
                logChannelID: null
            });

            await newGuild.save()
            .then(result => console.log(result))
            .catch(err => console.error(err));
        };
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);


    if (!member) return message.channel.send('I cannot find the specified member. Please mention a member in this Discord server.').then(m => m.delete({timeout: 5000}));

    if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('You do not have permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    if (!member.kickable) return message.channel.send('This user can\'t be kicked. It is either because they are a mod/admin, or their highest role is higher than mine 😔').then(m => m.delete({timeout: 5000}));

    if (message.member.roles.highest.position < member.roles.highest.position) return message.channel.send('You cannot kick someone with a higher role than you.').then(m => m.delete({timeout: 5000}));


    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');



    const kickembed = new Discord.MessageEmbed()
    .setTitle('I banned that user.')
    .setThumbnail(member.user.displayAvatarURL())
    .addField('Member', member)
    .addField('Moderator', message.author)
    .addField('Reason', reason)
    .setFooter('Time banned', client.user.displayAvatarURL())
    .setTimestamp()


    const logembed = new Discord.MessageEmbed()
    .setColor(15158332)
    .setTitle('User banned')
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Banned by', message.author)
    .addField('Reason', reason);

    member
    .ban({
        reason
    })
    message.channel.send(kickembed);

    if (!logChannel) {
        return
    } else {
 

        return logChannel.send(logembed);

    };
};


exports.help = {
  name: "ban",
  description: "Ban someone out of the guild",
  usage: `ban <mention | user ID>`,
  example: `ban @Bell`
}

exports.conf = {
  aliases: ["ban", "b"],
  cooldown: 5
}
