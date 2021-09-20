const { MessageEmbed, Permissions } = require('discord.js');
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args) => {

    const member = await getMemberfromMention(args[0], message.guild);
    const guildDB = client.guildsStorage.get(message.guild.id);
    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);
    const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare').toString() : ':pensive:';

    if (!member) return message.channel.send({ embeds: [{ color: "RED", description: `i can't find that user! please mention a valid member or user ID in this guild ${stareEmoji}` }] });

    if (!member.kickable) return message.reply({ embeds: [{ color: "RED", description: 'this user can\'t be kicked. it\'s either because they are a mod/admin, or their highest role is equal or higher than mine 😔' }] });

    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && message.member.roles.highest.position <= member.roles.highest.position) return message.reply({ embeds: [{ color: "RED", description: 'you cannot kick someone with a higher or equal role!' }] });

    let reason = 'No reason specified';
    if (args.length > 1) reason = args.slice(1).join(' ');
    const kickembed = new MessageEmbed()
        .setDescription(`🔨 i kicked **${member.user.tag}** for reason **${reason}**!`)
        .setColor("#ff0000")

    const logembed = new MessageEmbed()
        .setColor(15158332)
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setTitle('User kicked')
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Username', member.user.username)
        .addField('User ID', member.id)
        .addField('Moderator', message.author.toString())
        .addField('Reason', reason)
        .setFooter('Kicked at')
        .setTimestamp()

    try {
        if (!member.user.bot) member.send(`🔨 you were \`kicked\` from **${message.guild.name}** \n**reason**: ${reason}`);
        await member.kick(reason);
        await message.channel.send({ embeds: [kickembed] });
        if (!logChannel) {
            return;
        } else {
            const instance = new sendHook(client, logChannel, {
                username: message.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [logembed],
            })
            return instance.send();
        };
    } catch (error) {
        return message.channel.send(`an error happened when i tried to kick that user! can you try again later :pensive:`)
    };
};


exports.help = {
    name: "kick",
    description: "Kick someone.",
    usage: ["kick `<mention | user ID> [reason]`", "kick `<mention | user ID>`"],
    example: ["kick `@Bell because it has to be`", "kick `@kuru`"]
}

exports.conf = {
    aliases: ["k"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["KICK_MEMBERS"],
    clientPerms: ["KICK_MEMBERS"],
    channelPerms: ["EMBED_LINKS"]
}