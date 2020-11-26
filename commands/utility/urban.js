const urban = require("relevant-urban");
const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {
    if (!args[0]) return message.reply("pls enter something so i can search 👀");
    let result = await urban(args[0]).catch(e => {
        return message.reply(`i can't find definition for word phrase of **${args[0]}**, please try again pls :(`);
    })
    const embed = new MessageEmbed()
    .setTimestamp(new Date())
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setColor("RANDOM")
    .setTitle(result.word)
    .setURL(result.urbanURL)
    .setDescription(`**Definition:** \n*${result.definition}* \n\n**Example:** \n*${result.example}*`)
    .addField("Author", result.author, true)
    .addField("Rating", `👍 ${result.thumbsUp.toLocaleString()} | 👎 ${result.thumbsDown.toLocaleString()}`)

    if (result.tags.length > 0 && result.tags.join(" ").length < 1024) {
        embed.addField("Tags", result.tags.join(", "), true);
    }
    return message.channel.send(embed);
}

exports.help = {
    name: "urban",
    description: "get the definition for a word\n*but in urban dictionary*😂",
    usage: "urban <word>",
    example: "urban google"
}

exports.conf = {
    aliases: [],
    cooldown: 5
}
