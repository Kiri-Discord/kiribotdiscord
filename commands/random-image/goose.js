const { MessageEmbed } = require('discord.js');
const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    const gooseEmoji = client.customEmojis.get('goose') ? client.customEmojis.get('goose') : ':duck:';
    const data = await sfw.goose();
    const embed = new MessageEmbed()
        .setDescription(`${gooseEmoji}`)
        .setImage(data.url)
    return message.channel.send({ embeds: [embed] })
};


exports.help = {
    name: "goose",
    description: "get a random image of a goose",
    usage: ["goose"],
    example: ["goose"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS"]
};