const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args) => {
    const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
    if (targetChannel.type !== 'GUILD_TEXT') return message.reply({ embeds: [{ color: "#bee7f7", description: `only normal text channel can subscribe to new update :pensive: (subscribing from an another announcement channel is not possible)` }] });
    if (!targetChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages, webhooks and embed links to ${targetChannel}! can you check my perms? :pensive:` }] });
    const channel = await client.channels.fetch(client.config.updateChannelID);
    await channel.addFollower(targetChannel, "Kiri Bot Updates and Announcement");
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `✅ added your channel ${targetChannel} to the update hub!` }] });
    const messages = await channel.messages.fetch({ limit: 5 });
    if (messages.size) {
        let embedArray = [];
        messages.each(msg => {
            const embed = new MessageEmbed()
                .setThumbnail(client.user.displayAvatarURL({ size: 4096 }))
                .setAuthor(`Staff: ${msg.author.tag}`, msg.author.displayAvatarURL({ format: 'png', dynamic: true }))
                .setDescription(msg.content)
                .setTimestamp(msg.createdAt)
                .setFooter(client.user.username)
            embedArray.push(embed);
        });
        return targetChannel.send({
            content: `**${messages.size} recent update** (oldest to latest):`,
            embeds: embedArray
        });
    };
};

exports.help = {
    name: "update",
    description: "subscribe your channel to my update and announcement hub, and send recent updates",
    usage: ["update `[#channel]`", "update"],
    example: ["update `#kiri-update`", "update"]
};

exports.conf = {
    aliases: ['changelog'],
    cooldown: 4,
    guildOnly: true,
    userPerms: ['MANAGE_WEBHOOKS']
};