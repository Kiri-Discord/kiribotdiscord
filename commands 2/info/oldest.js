const { MessageEmbed } = require('discord.js')
const moment = require('moment');

exports.run = async(client, message, args) => {
    let mem = message.guild.members.cache
        .filter((m) => !m.user.bot)
        .sort((a, b) => a.user.createdAt - b.user.createdAt)
        .first();

    let createdate = moment.utc(mem.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss");

    const Embed = new MessageEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setColor(message.member.displayHexColor)
        .setTimestamp()
        .setImage(mem.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setTitle(`The oldest user in ${message.guild.name} is ${mem.user.tag}!`)
        .setDescription(`That user joined Discord in \`${createdate}\`!`);
    message.channel.send({ embeds: [embed] });
};


exports.help = {
    name: "oldest",
    description: "get the oldest account creation date in the guild!",
    usage: `oldest`,
    example: `oldest`
}

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
}