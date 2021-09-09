const { MessageEmbed } = require("discord.js")
const fetch = require('node-fetch');

exports.run = async(client, message, args) => {
    const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(`${message.author.username} cried :(`, message.author.displayAvatarURL())

    fetch('https://neko-love.xyz/api/v1/cry')
        .then(res => res.json())
        .then(json => embed.setImage(json.url))
        .then(() => message.channel.send({ embeds: [embed] }))
        .catch(err => {
            message.channel.send("i can't seem to be able to do that :( here is a hug for now 🤗");
            return console.error(err);
        });

}
exports.help = {
    name: "cry",
    description: "just let it all out :pensive:",
    usage: "cry",
    example: "cry"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}