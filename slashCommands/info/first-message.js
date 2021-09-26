const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    if (channel.type !== 'GUILD_TEXT') return interaction.reply({
        content: 'you can only mention a text channel!',
        ephemeral: true
    });
    if (!channel.permissionsFor(interaction.guild.me).has('READ_MESSAGE_HISTORY')) return interaction.reply({
        content: ":x: i don't have the \`READ_MESSAGE_HISTORY\` permission to read the first message there...",
        ephemeral: true
    });
    await interaction.deferReply();
    const messages = await channel.messages.fetch({ after: 1, limit: 1 });
    const msg = messages.first();
    const embed = new MessageEmbed()
        .setColor(msg.member ? msg.member.displayHexColor : 0x00AE86)
        .setThumbnail(msg.author.displayAvatarURL({ format: 'png', dynamic: true }))
        .setAuthor(msg.author.tag)
        .setDescription(msg.content)
        .setTimestamp(msg.createdAt)
        .setFooter(`ID: ${msg.id}`)
        .addField('Jump to message', `[Click me to jump](${msg.url})`);
    return interaction.editReply({ embeds: [embed] });
};


exports.help = {
    name: "first-message",
    description: "find the first ever sent message in a channel",
    usage: ["first-message"],
    example: ["first-message"]
};

exports.conf = {
    cooldown: 5,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addChannelOption(option => option
            .setName('channel')
            .setRequired(false)
            .setDescription('where do you want to find the first message?')
        ),
    guild: true,
    channelPerms: ["EMBED_LINKS", "READ_MESSAGE_HISTORY"]
};