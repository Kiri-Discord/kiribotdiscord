const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;

exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("cry")

    const embed = new Discord.MessageEmbed() 
    .setColor("RANDOM") 
    .setAuthor(`${message.author.username} cried :(`, message.author.displayAvatarURL()) 
    .setImage(data)
    return message.channel.send(embed)

}
exports.help = {
    name: "cry",
    description: "just let it all out",
    usage: "cry",
    example: "cry"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}