const { MessageEmbed } = require('discord.js')

exports.run = async(client, message, args) => {
    let mem = message.guild.members.cache
        .filter((m) => !m.user.bot)
        .sort((a, b) => a.user.createdAt - b.user.createdAt)
        .first();
    let createdate = `<t:${Math.floor(mem.user.createdTimestamp / 1000)}:F> (<t:${Math.floor(mem.user.createdTimestamp / 1000)}:R>)`;

    const embed = new MessageEmbed()
        .setColor('#bee7f7')
        .setTimestamp()
        .setImage(mem.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setAuthor(`the oldest user in ${message.guild.name} is ${mem.user.tag}!`)
        .setDescription(`${mem.toString()} joined Discord in ${createdate} !`);
    return message.channel.send({ embeds: [embed] });
};


exports.help = {
    name: "oldest",
    description: "get the oldest account creation date in the guild!",
    usage: [`oldest`],
    example: [`oldest`]
}

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}