const urban = require("relevant-urban");
const { MessageEmbed } = require('discord.js')

exports.run = async(client, message, args) => {
    let result;
    let query = args.join(" ");
    if (!query) return message.reply("pls enter something so i can search 👀");

    try {
        result = await urban(query)
    } catch (error) {
        return message.reply(`i can't find definition for the word phrase of **${query}** :pensive:`);
    }

    const embed = new MessageEmbed()
        .setTimestamp(new Date())
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setColor("#7DBBEB")
        .setTitle(result.word)
        .setURL(result.urbanURL)
        .setDescription(`**Definition:** \n*${result.definition}* \n\n**Example:** \n*${result.example}*`)
        .addField("Author", result.author, true)
        .addField("Rating", `👍 ${result.thumbsUp.toLocaleString()} | 👎 ${result.thumbsDown.toLocaleString()}`)

    if (result.tags.length > 0 && result.tags.join(" ").length < 1024) {
        embed.addField("Tags", result.tags.join(", "), true);
    }
    return message.channel.send({ embeds: [embed] });
};

exports.help = {
    name: "urban",
    description: "get the definition for a word in urban dictionary",
    usage: ["urban `<word>`"],
    example: ["urban `google`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};