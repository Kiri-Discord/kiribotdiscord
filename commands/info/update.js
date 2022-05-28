const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
    if (targetChannel.type !== 'GUILD_TEXT') return message.reply({ embeds: [{ color: "#bee7f7", description: `only normal text channel can subscribe to new update :pensive: (subscribing from an another announcement channel is not possible)` }] });
    if (!targetChannel.viewable || !targetChannel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages, webhooks and embed links to ${targetChannel}! can you check my perms? :pensive:` }] });
    const { body } = await request
    .post(`https://discord.com/api/v9/channels/${client.config.updateChannelID}/followers`)
    .set({ Authorization: `Bot ${client.config.token}` })
    .send({
        webhook_channel_id: targetChannel.id,
    });
    // const channel = await client.channels.fetch(client.config.updateChannelID);
    // await channel.addFollower(targetChannel, "Kiri Bot Updates and Announcement");
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `✅ added your channel ${targetChannel} to the update hub!` }] });
    const res = await request
    .get(`https://discord.com/api/v9/channels/${client.config.updateChannelID}/messages`)
    .set({ Authorization: `Bot ${client.config.token}` })
    .query({ limit: 10 });
    const messages = res.body;
    // const messages = await channel.messages.fetch({ limit: 5 });
    if (messages.length) {
        let embedArray = [];
        messages.forEach(msg => {
            const embed = new MessageEmbed()
                .setThumbnail(client.user.displayAvatarURL({ size: 4096 }))
                .setAuthor({name: `Staff: ${msg.author.username}#${msg.author.discriminator}`})
                .setDescription(msg.content)
                .setTimestamp(msg.timestamp)
                .setFooter({text: client.user.username})
            embedArray.push(embed);
        });
        return targetChannel.send({
            content: `**${messages.length} recent update** (latest to oldest):`,
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
    cooldown: 15,
    guildOnly: true,
    userPerms: ['MANAGE_WEBHOOKS']
};