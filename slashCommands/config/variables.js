const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const embed = new MessageEmbed()
        .setTitle(`${client.user.username}'s valid placeholder`)
        .setColor("#bee7f7")
        .setDescription(`the below placeholders are valid in embed command, and setgreeting / setgoodbye, and leveling command.`)
        .addField("user / author information", stripIndents `
        \`{user}\`
        \`{user_tag}\`
        \`{user_name}\`
        \`{user_avatar}\`
        \`{user_discriminator}\`
        \`{user_id}\`
        \`{user_nick}\`
        \`{user_joindate}\`
        \`{user_createdate}\`
        \`{user_xp}\`
        \`{user_level}\`
        `, true)
        .addField("server general information", stripIndents `
        \`{server_name}\`
        \`{server_id}\`
        \`{server_membercount}\`
        \`{server_membercount_ordinal}\`
        \`{server_icon}\`
        `, true)
        .addField(`default response (modifiy with /response)`, "\`{auto}\`")

    return interaction.reply({ embeds: [embed] });
}


exports.help = {
    name: "variables",
    description: "gives you a list of valid placeholders for embeds, response, and more!",
    usage: ["variables"],
    example: ["variables"]
};

exports.conf = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};