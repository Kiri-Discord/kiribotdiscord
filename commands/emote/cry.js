const Discord = require("discord.js")
const { Random } = require("something-random-on-discord")
const random = new Random();

exports.run = async (client, message, args) => {

    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    }); 
    
    const prefix = setting.prefix;
    let data = await random.getAnimeImgURL("cry")

    const embed = new Discord.MessageEmbed() 
    .setColor("RANDOM") 
    .setAuthor(`${message.author.username} cried :( someone pls use \`${prefix}hug\` to make them feel better :pensive:`, message.author.displayAvatarURL()) 
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