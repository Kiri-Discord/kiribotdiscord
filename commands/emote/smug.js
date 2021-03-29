const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;

exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("smug")

    const embed = new Discord.MessageEmbed() 
    .setColor("RANDOM") 
    .setAuthor(`${message.author.username} just smugged 😏`, message.author.displayAvatarURL()) 
    .setImage(data)
    return message.channel.send(embed)

}



exports.help = {
    name: "smug",
    description: "just try it out 🤔",
    usage: "smug",
    example: "smug"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}