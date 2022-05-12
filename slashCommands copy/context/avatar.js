const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { stripIndents } = require('common-tags');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user');

    let avatar = member.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' });
    const { user } = member;

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
    return interaction.reply({ embeds: [embed], components: [row] });
};

exports.help = {
    name: "Display avatar",
    description: "display an user's avatar",
};

exports.conf = {
    cooldown: 3,
    guildOnly: true,
    data: new ContextMenuCommandBuilder()
        .setType(ApplicationCommandType.User)
        .setName(exports.help.name),
    channelPerms: ["EMBED_LINKS"],
    context: true
};