const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args) => {

    const member = await getMemberfromMention(args[0], message.guild);

    const guildDB = client.guildsStorage.get(message.guild.id);

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare').toString() : ':pensive:';

    if (!member) return message.channel.send({ embeds: [{ color: "RED", description: `i can't find that user! please mention a valid member or user ID in this guild ${stareEmoji}` }] });

    if (!member.bannable) return message.reply({ embeds: [{ color: "RED", description: 'this user can\'t be banned. it\'s either because they are a mod/admin, or their highest role is equal or higher than mine 😔' }] });

    if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.reply({ embeds: [{ color: "RED", description: 'you cannot ban someone with a higher role than you!' }] });


    let reason = 'No reason specified';

    if (args.length > 1) reason = args.slice(1).join(' ');



    const banembed = new MessageEmbed()
        .setDescription(`🔨 i banned **${member.user.tag}** with reason **${reason}**!`)
        .setColor("#ff0000")


    const logembed = new MessageEmbed()
        .setColor(15158332)
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setTitle('User banned')
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Username', member.user.username)
        .addField('User ID', member.id)
        .addField('Moderator', message.author.toString())
        .setFooter('Banned at')
        .addField('Reason', reason)
        .setTimestamp()
    if (!member.user.bot) await member.send(`🔨 you were \`banned\` from **${message.guild.name}** \n**reason**: ${reason}`).catch(() => null);
    try {
        await member.ban({ reason });
        await message.channel.send({ embeds: [banembed] });
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
        return message.channel.send(`an error happened when i tried to ban that user. can you try again later?`)
    };
};


exports.help = {
    name: "ban",
    description: "ban someone from the server",
    usage: ["ban `<mention | user ID> [reason]`", "ban `<mention | user ID>`"],
    example: ["ban `@Bell because it has to be`", "ban `@kuru`"]
}

exports.conf = {
    aliases: ["b"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["BAN_MEMBERS"],
    clientPerms: ["BAN_MEMBERS"],
    channelPerms: ["EMBED_LINKS"]
};