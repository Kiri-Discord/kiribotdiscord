const Discord = require("discord.js")
const { Random } = require("something-random-on-discord")
const random = new Random();

exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("smug")

    const embed = new Discord.MessageEmbed() 
    .setColor("RANDOM") 
    .setDescription(`<@${message.author.id}> just smugged 😏`) 
    .setImage(data)
    message.channel.send(embed)

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