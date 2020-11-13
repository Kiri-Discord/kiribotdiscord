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
    .setColor("#ff9900") 
    .setDescription(`<@${message.author.id}> cried :( someone pls use \`${prefix}hug\`to make them feel better :pensive:`) 
    .setImage(data)
    .setTimestamp(new Date())
    .setFooter(client.user.tag, client.user.displayAvatarURL())
    .setAuthor(message.author.tag,  message.author.displayAvatarURL({ dynamic: true }))


    message.channel.send(embed)

}



exports.help = {
    name: "cry",
    description: "just let it all out",
    usage: "cry",
    example: "cry"
};

exports.conf = {
    aliases: [],
    cooldown: 4
}