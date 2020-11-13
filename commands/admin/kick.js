const Discord = require('discord.js')

exports.run = async (client, message, args) => {

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);


    if (!member) return message.channel.send('I cannot find the specified member. Please mention a member in this Discord server.').then(m => m.delete({timeout: 5000}));

    if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('You do not have \`Kick Members\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    if (!member.kickable) return message.channel.send('This user can\'t be kicked. It is either because they are a mod/admin, or their highest role is higher than mine 😔').then(m => m.delete({timeout: 5000}));

    if (message.member.roles.highest.position < member.roles.highest.position) return message.channel.send('You cannot kick someone with a higher role than you.').then(m => m.delete({timeout: 5000}));


    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');



    const kickembed = new Discord.MessageEmbed()
    .setTitle(`${member.user.tag} was kicked!`)
    .setColor("#ff0000")
    .setThumbnail(member.user.displayAvatarURL())
    .setAuthor(client.user.tag, client.user.displayAvatarURL())
    .addField('Member', member)
    .addField('Moderator', message.author)
    .addField('Reason', reason)
    .setFooter('Time kicked', client.user.displayAvatarURL())
    .setTimestamp()


    const logembed = new Discord.MessageEmbed()
    .setAuthor(client.user.tag, client.user.displayAvatarURL())
    .setTitle('User kicked')
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Kicked by', message.author)
    .addField('Reason', reason);


    member.send(`🔨You were \`kicked\` from **${message.guild.name}** \n**Reason**: ${reason}.`);

    setTimeout(function(){
        member.kick({reason}) 
    }, 2000)
    
    message.channel.send(kickembed);

    if (!logChannel) {
        return
    } else {
 

        return logChannel.send(logembed);

    };
};


exports.help = {
  name: "kick",
  description: "Kick someone out of the guild",
  usage: `kick <mention | user ID> [reason]`,
  example: `kick @Bell because it has to be`
}

exports.conf = {
  aliases: ["k"],
  cooldown: 5
}
