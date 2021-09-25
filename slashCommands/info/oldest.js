const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    let mem = interaction.guild.members.cache
        .filter((m) => !m.user.bot)
        .sort((a, b) => a.user.createdAt - b.user.createdAt)
        .first();
    let createdate = `<t:${Math.floor(mem.user.createdAt.getTime()/1000)}:F> (<t:${Math.floor(mem.user.createdAt.getTime()/1000)}:R>)`;

    const embed = new MessageEmbed()
        .setColor(mem.displayHexColor)
        .setTimestamp()
        .setImage(mem.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setTitle(`The oldest user in ${interaction.guild.name} is ${mem.user.tag}!`)
        .setDescription(`${mem.toString()} joined Discord in ${createdate} !`);
    return interaction.reply({ embeds: [embed] });
};


exports.help = {
    name: "oldest",
    description: "get the oldest account creation date in the guild!",
    usage: [`oldest`],
    example: [`oldest`]
};

exports.conf = {
    cooldown: 3,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name).setDescription(exports.help.description),
    guild: true,
    channelPerms: ["EMBED_LINKS"]
};