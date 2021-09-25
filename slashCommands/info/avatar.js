const { MessageEmbed } = require("discord.js");
const { stripIndents } = require('common-tags');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user') || interaction.member;
    const { user } = member;
    const avatar = user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' });

    const embed = new MessageEmbed()
        .setTitle(`${user.tag}`)
        .setDescription(stripIndents `
        ID: \`${user.id}\`
        [**Avatar URL**](${avatar})
        `)
        .setImage(avatar)
    return interaction.reply({ embeds: [embed] });
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
            .setDescription('which member would you like to get the avatar for?')
        ),
    guild: true,
    channelPerms: ["EMBED_LINKS"]
};