const { MessageEmbed } = require("discord.js");
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args) => {

    const guildDB = client.guildsStorage.get(message.guild.id)

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);


    const member = await getMemberfromMention(args[0], message.guild);
    const sipEmoji = client.customEmojis.get('sip') ? client.customEmojis.get('sip') : ':thinking:';
    const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare') : ':pensive:';
    if (!member) return message.inlineReply(`i can't find that member on this server. can you get me a correct mention or user ID? ${sipEmoji}`);
    const { user } = member;

    let nick = args.slice(1).join(" ");
    if (!nick) return message.channel.send("you need to input the nickname!");

    const rolelog = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(`**${user}** nickname was changed to **${nick}**`)
        .addField('User ID', user.id)
        .addField('Moderator', message.author)
        .setTimestamp()

    try {
        await member.setNickname(nick);
        await message.channel.send({ embed: { color: "f3f3f3", description: `➕ i changed **${user}** nickname to **${nick}**!` } });
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
        return message.channel.send({ embed: { color: "f3f3f3", description: `ouch, i bumped by an error. can you check my perms? ${stareEmoji}\nthat user might have the same role or a higher role than me.` } });
    };
};

exports.help = {
    name: "setnickname",
    description: "set a user nickname.",
    usage: "setnickname `<@user> <nick>`",
    example: "setnickname `@bell#9999 hoisted`"
}

exports.conf = {
    aliases: ["setnick"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_NICKNAMES"],
    clientPerms: ["MANAGE_NICKNAMES"],
    channelPerms: ["EMBED_LINKS"]
}