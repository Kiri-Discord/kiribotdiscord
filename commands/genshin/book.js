const { MessageEmbed } = require("discord.js");

exports.run = (client, message, args) => {
    const { genshinData } = client;

    const { books } = genshinData;
    
    const embed = new MessageEmbed()
    .setThumbnail('https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Item_Guide_to_Freedom.png/revision/latest?cb=20210106071929')
    .setColor('#cbd4c2')
    .setTitle('Talent books')
    .setDescription(`${Object.entries(books).map(([day, books]) => `**${day}**: ${books.map(book => `${genshinData.emoji(`Guide to ${book}`)} ${book}`).join(" / ")}`).join("\n")}\n**Sunday**: All books are available`)

    return message.channel.send({ embeds: [embed] })
};
exports.help = {
    name: "talent",
    description: "list all talent book days",
    usage: ["talent"],
    example: ["talent"]
};

exports.conf = {
    aliases: ['talents', 'talentbook'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}