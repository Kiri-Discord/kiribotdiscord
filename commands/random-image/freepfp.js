const { MessageEmbed } = require('discord.js');
const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    let data = await sfw.waifu();
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setDescription(`powered by bell's homework folder`)
        .setImage(data.url)
    return message.channel.send({ embeds: [embed] })
}

exports.help = {
    name: "freepfp",
    description: "generate an anime pfp for you",
    usage: "freepfp",
    example: "freepfp"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
};