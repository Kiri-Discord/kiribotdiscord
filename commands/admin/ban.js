const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {

    const member = await getMemberfromMention(args[0], message.guild);

    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare') : ':pensive:';
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';

    if (!member) return message.inlineReply(`i can't find that user! pls mention a valid member or user ID in this guild ${stareEmoji}`);

    if (!member.bannable) return message.inlineReply('this user can\'t be banned. it\'s either because they are a mod/admin, or their highest role is higher than mine 😔');

    if (message.member.roles.highest.position < member.roles.highest.position) return message.inlineReply('you cannot ban someone with a higher role than you!')


    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');



    const banembed = new MessageEmbed()
    .setTitle(`${member.user.tag} was banned!`)
    .setColor("#ff0000")
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setThumbnail(member.user.displayAvatarURL())
    .addField('Member', member)
    .addField('Moderator', message.author)
    .addField('Reason', reason)
    .setFooter('Time banned', client.user.displayAvatarURL())
    .setTimestamp()


    const logembed = new MessageEmbed()
    .setColor(15158332)
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setTitle('User banned')
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Banned by', message.author)
    .addField('Reason', reason);

    try {
        if (!member.user.bot) member.send(`🔨 you were \`banned\` from **${message.guild.name}** \n**reason**: ${reason}`);
        await member.ban(reason);
        await message.channel.send(banembed);
        if (!logChannel) {
            return;
        } else {
            return logChannel.send(logembed);
        };
    } catch (error) {
        return message.channel.send(`an error happened when i tried to ban that user ${sedEmoji} can you check my perms?`)
    }
};


exports.help = {
  name: "ban",
  description: "ban someone out of the guild",
  usage: ["ban `<mention | user ID> [reason]`", "ban `<mention | user ID>`"],
  example: ["ban `@Bell because it has to be`", "ban `@kuru`"]
}

exports.conf = {
  aliases: ["b"],
  cooldown: 3,
  guildOnly: true,
  userPerms: ["BAN_MEMBERS"],
  clientPerms: ["BAN_MEMBERS", "SEND_MESSAGES", "EMBED_LINKS"]
}
