const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { stripIndents } = require('common-tags');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user') || interaction.member;
    const server = interaction.options.getBoolean('server');
    let avatar;
    let original = true;
    const { user } = member;

    if (server) {
        avatar = member.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' });
        original = false;
    } else {
        avatar = member.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' });
    };

    const embed = new MessageEmbed()
        .setTitle(`${user.tag}`)
        .setDescription(stripIndents `
        ID: \`${user.id}\`
        [**Avatar URL**](${avatar})
        `)
        .setImage(avatar)
    const row = new MessageActionRow()
        .addComponents(new MessageButton()
            .setStyle('LINK')
            .setURL(avatar)
            .setLabel('Avatar URL'))
    return interaction.reply({ embeds: [embed], components: [row], content: original ? `if you want to display their server avatar instead (if any), do \`${prefix}avatar -server\`!` : null });
};

exports.help = {
    name: "avatar",
    description: "display an user's avatar",
    usage: ["avatar [@user]"],
    example: ["avatar `@kiri#6822`", "avatar"]
};

exports.conf = {
    cooldown: 3,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(false)
            .setDescription('which member would you like to get the avatar for? :)')
        )
        .addBooleanOption(option => option
            .setName('server')
            .setDescription('do you want to display their server avatar instead?')
        ),
    guild: true,
    channelPerms: ["EMBED_LINKS"]
};