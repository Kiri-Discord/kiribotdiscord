const Discord = require('discord.js')

exports.run = async (client, message, args) => {

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);


    if (!member) return message.inlineReply('pls mention a valid member or user ID in this guild :)').then(m => m.delete({timeout: 5000}));


    if (!member.kickable) return message.inlineReply('this user can\'t be kicked. it\'s either because they are a mod/admin, or their highest role is higher than mine 😔').then(m => m.delete({timeout: 5000}));

    if (message.member.roles.highest.position < member.roles.highest.position) return message.inlineReply('you can\'t kick someone with a higher role than you!').then(m => m.delete({timeout: 5000}));


    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');



    const kickembed = new Discord.MessageEmbed()
    .setTitle(`${member.user.tag} was kicked!`)
    .setColor("#ff0000")
    .setThumbnail(member.user.displayAvatarURL())
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .addField('Member', member)
    .addField('Moderator', message.author)
    .addField('Reason', reason)
    .setFooter('Time kicked', client.user.displayAvatarURL())
    .setTimestamp()


    const logembed = new Discord.MessageEmbed()
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setTitle('User kicked')
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Kicked by', message.author)
    .addField('Reason', reason);


    message.channel.send(kickembed)
    .then(() => {
        try {
            member.send(`🔨 you were \`kicked\` from **${message.guild.name}** \n**reason**: ${reason}.`)
        } catch (error) {
            throw error
        }
    })
    .then(() => member.kick(reason))
    .then(() => {
        if (!logChannel) {
            return
        } else {
     
    
            return logChannel.send(logembed);
    
        };
    })
};


exports.help = {
  name: "kick",
  description: "kick someone out of the guild.",
  usage: ["kick `<mention | user ID> [reason]`", "kick `<mention | user ID>`"],
  example: ["kick `@Bell because it has to be`", "kick `@kuru`"]
}

exports.conf = {
  aliases: ["k"],
  cooldown: 5,
  guildOnly: true,
  userPerms: ["KICK_MEMBERS"],
  clientPerms: ["KICK_MEMBERS", "SEND_MESSAGES", "EMBED_LINKS"]
}
