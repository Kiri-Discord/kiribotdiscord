const { getServerTimeInfo } = require("../../features/genshin/utils");
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
    const { genshinData } = client;
    const { paimonsBargains } = genshinData;

    const serverTimes = getServerTimeInfo()
    const currentMonths = serverTimes.map(st => st.time.getMonth());
    const embed = new MessageEmbed()
    .setTitle("Paimon's Bargains")
    .setThumbnail('https://static.wikia.nocookie.net/gensin-impact/images/6/69/Item_Masterless_Starglitter.png')
    .setColor('#cbd4c2')
    const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let bargains = String();
    for (let i = 0; i < paimonsBargains.length; i++) {
        const shop = paimonsBargains[i]
        const shopStuff = `**${shop.weapon}** Series / ${shop.char.map(book => `**${book}**`).join(" / ")}`

        if (currentMonths.some(mo => mo == i))
            bargains += `**\`${months[i]}\`**\`${months[i + 6]}\`: ${shopStuff}\n`
        else if (currentMonths.some(mo => mo == i + 6))
            bargains += `\`${months[i]}\`**\`${months[i + 6]}\`**: ${shopStuff}\n`
        else
            bargains += `\`${months[i]}\`\u200B\`${months[i + 6]}\`: ${shopStuff}\n`
    };
    embed.setDescription(bargains);
    return message.channel.send({ embeds: [embed] });
}


exports.help = {
    name: "paimonshop",
    description: "look up rotation of Paimon's Bargains Shop",
    usage: ["paimonshop"],
    example: ["paimonshop"]
};

exports.conf = {
    aliases: ['pshop', 'paimon'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}