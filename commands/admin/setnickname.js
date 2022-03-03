const { MessageEmbed } = require("discord.js");
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args, prefix) => {
    if (!args.length) return message.channel.send({ embeds: [{ color: "#abb7b2", description: `you should follow the correct usage! use \`${prefix}help setnickname\` to learn more :wink:` }] });
    const guildDB = client.guildsStorage.get(message.guild.id)

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);


    const member = client.utils.parseMember(message, args[0])
    const stareEmoji = client.customEmojis.get('staring') ? client.customEmojis.get('staring').toString() : ':pensive:';
    if (!member) return message.channel.send({ embeds: [{ color: "RED", description: `i can't find that user! please mention a valid member or user ID in this guild ${stareEmoji}` }] });

    if (!member.manageable) return message.reply({ embeds: [{ color: "RED", description: `i can't change that user's nickname! they may either be an admin, or their roles are way higher than me.` }] });

    const { user } = member;

    let nick = args.slice(1).join(" ");
    if (!nick) return message.channel.send({ embeds: [{ color: "RED", description: `what nickname do you want to set for ${member.toString()}?` }] });
    if (nick.length > 32) return message.channel.send({ embeds: [{ color: "RED", description: `your nickname can't be longer than 32 characters!` }] });

    const oldNick = member.displayName;
    const rolelog = new MessageEmbed()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setDescription(`**${user}** nickname was changed to **${nick}**`)
        .addField('Before', oldNick)
        .addField('Moderator', message.author.toString())
        .setTimestamp()

    try {
        await member.setNickname(nick);
        await message.channel.send({ embeds: [{ color: "#bee7f7", description: `✅ i have changed **${user}** nickname to **${nick}** from **${oldNick}**!` }] });
        if (!logChannel) {
            return;
        } else {
            const instance = new sendHook(client, logChannel, {
                username: message.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [rolelog],
            })
            return instance.send();
        }
    } catch (error) {
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `ouch, i bumped by an error. can you check my perms? ${stareEmoji}\nthat user might have the same role or a higher role than me.` }] });
    };
};

exports.help = {
    name: "setnickname",
    description: "set an user's nickname.",
    usage: ["setnickname `<@user> <nickname>`"],
    example: ["setnickname `@Bell#9999 Admin`"]
}

exports.conf = {
    aliases: ["setnick"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_NICKNAMES"],
    clientPerms: ["MANAGE_NICKNAMES"],
    channelPerms: ["EMBED_LINKS"]
}