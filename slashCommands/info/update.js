const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    if (!targetChannel.viewable || !targetChannel.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages, webhooks and embed links to ${targetChannel}! can you check my perms? :pensive:` }], ephemeral: true });
    await interaction.deferReply();
    const channel = await client.channels.fetch(client.config.updateChannelID);
    await channel.addFollower(targetChannel, "Kiri Bot Updates and Announcement");
    interaction.editReply({ embeds: [{ color: "#bee7f7", description: `✅ added your channel ${targetChannel} to the update hub!` }] });
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
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addChannelOption(option => option
            .setName('channel')
            .setRequired(false)
            .setDescription('which channel would you like to be subscribed?')
            .addChannelType(ChannelType.GuildText)
        ),
    cooldown: 4,
    guildOnly: true,
    userPerms: ['MANAGE_WEBHOOKS']
};