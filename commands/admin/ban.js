const Discord = require('discord.js')

exports.run = async (client, message, args) => {

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);


    if (!member) return message.reply('i cannot find the specified member. pls mention a member or user ID in this guild.').then(m => m.delete({timeout: 5000}));

    if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply("you don't have \`BAN_MEMBERS\` permission to use this command 😔").then(m => m.delete({timeout: 5000}));

    if (!member.kickable) return message.reply('this user can\'t be kicked. it\'s either because they are a mod/admin, or their highest role is higher than mine 😔').then(m => m.delete({timeout: 5000}));

    if (message.member.roles.highest.position < member.roles.highest.position) return message.reply('you cannot kick someone with a higher role than you.').then(m => m.delete({timeout: 5000}));


    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');



    const kickembed = new Discord.MessageEmbed()
    .setTitle(`${member.user.tag} was banned!`)
    .setColor("#ff0000")
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setThumbnail(member.user.displayAvatarURL())
    .addField('Member', member)
    .addField('Moderator', message.author)
    .addField('Reason', reason)
    .setFooter('Time banned', client.user.displayAvatarURL())
    .setTimestamp()


    const logembed = new Discord.MessageEmbed()
    .setColor(15158332)
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setTitle('User banned')
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Banned by', message.author)
    .addField('Reason', reason);

    message.channel.send(kickembed);

    

    member.send(`🔨you were \`banned\` from **${message.guild.name}** \n**reason**: ${reason}.`);

    setTimeout(function(){
        member.ban({reason}) 
    }, 2000)




    if (!logChannel) {
        return
    } else {
 

        return logChannel.send(logembed);

    };

};


exports.help = {
  name: "ban",
  description: "ban someone out of the guild",
  usage: `ban <mention | user ID> [reason]`,
  example: `ban @Bell because it has to be`
}

exports.conf = {
  aliases: ["b"],
  cooldown: 5,
  guildOnly: true
}
