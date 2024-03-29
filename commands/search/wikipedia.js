const { MessageEmbed } = require("discord.js");
const axios = require("axios").default;

exports.run = async(client, message, args) => {
    const query = args.join(" ").trim();
    if (!query) return message.reply(`you have to search for something!`);

    const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36' };
    axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { headers }).then(res => {
        const article = res.data;

        const wikipedia = new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setTitle(`**${article.title}**`)
            .setURL(article.content_urls.desktop.page)
            .setDescription(`> ${article.extract}`)
            .setThumbnail(article.originalimage ? article.originalimage.source : null)
        return message.channel.send({ embeds: [wikipedia] });
    }).catch((err) => {
        message.reply(`i found no article with the title "${query}" :pensive:`);
    });
}

exports.help = {
    name: "wikipedia",
    description: "searches Wikipedia! right on Discord!",
    usage: ["wikipedia `<query>`"],
    example: ["wikipedia `One Piece`"]
}

exports.conf = {
    aliases: ["wiki"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}