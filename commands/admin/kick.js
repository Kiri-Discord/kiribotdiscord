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

    if (!member.kickable) return message.inlineReply('this user can\'t be kicked. it\'s either because they are a mod/admin, or their highest role is higher than mine 😔');

    if (message.member.roles.highest.position < member.roles.highest.position) return message.inlineReply('you cannot kick someone with a higher role than you!')

    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');


    const kickembed = new MessageEmbed()
    .setTitle(`${member.user.tag} was kicked!`)
    .setColor("#ff0000")
    .setThumbnail(member.user.displayAvatarURL())
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .addField('Member', member)
    .addField('Moderator', message.author)
    .addField('Reason', reason)
    .setFooter('Time kicked', client.user.displayAvatarURL())
    .setTimestamp()


    const logembed = new MessageEmbed()
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setTitle('User kicked')
    .setThumbnail(member.user.avatarURL())
    .addField('Username', member.user.username)
    .addField('User ID', member.id)
    .addField('Kicked by', message.author)
    .addField('Reason', reason);

    try {
        if (!member.user.bot) member.send(`🔨 you were \`kicked\` from **${message.guild.name}** \n**reason**: ${reason}`);
        await member.kick(reason);
        await message.channel.send(kickembed);
        if (!logChannel) {
            return;
        } else {
            return logChannel.send(logembed);
        };
    } catch (error) {
        return message.channel.send(`an error happened when i tried to ban that user ${sedEmoji} can you check my perms?`)
    };
};


exports.help = {
  name: "kick",
  description: "kick someone out of the guild.",
  usage: ["kick `<mention | user ID> [reason]`", "kick `<mention | user ID>`"],
  example: ["kick `@Bell because it has to be`", "kick `@kuru`"]
}

exports.conf = {
  aliases: ["k"],
  cooldown: 3,
  guildOnly: true,
  userPerms: ["KICK_MEMBERS"],
  clientPerms: ["KICK_MEMBERS", "SEND_MESSAGES", "EMBED_LINKS"]
}
