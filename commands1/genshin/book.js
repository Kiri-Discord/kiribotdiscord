const { MessageEmbed } = require("discord.js");

exports.run = (client, message, args) => {
    const { genshinData } = client;

    const { materials } = genshinData
    const allBooks = Object.values(materials)
        .filter(x => x.type == "Talent Level-Up Material" && x.stars == 3)
    const days = [
        ["Monday & Thursday", "Monday/Thursday/Sunday"],
        ["Tuesday & Friday", "Tuesday/Friday/Sunday"],
        ["Wednesday & Saturday", "Wednesday/Saturday/Sunday"]
    ].map(([days, source]) => {
        const books = allBooks.filter(b => b.sources?.some(s => s.endsWith(`(${source})`))).map(b => b.name)
        return { days, books }
    })
    
    const embed = new MessageEmbed()
    .setThumbnail('https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Item_Guide_to_Freedom.png/revision/latest?cb=20210106071929')
    .setColor('#cbd4c2')
    .setTitle('Talent books')
    .setDescription(`${days.map(({ days, books }) => `**${days}**: ${books.map(book => `${genshinData.emoji(book)} ${book.split(" ").pop()}`).join(" / ")}`).join("\n")}\n**Sunday**: All books are available`)

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