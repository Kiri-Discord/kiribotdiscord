const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    let garden = await client.garden.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!garden) {
        const model = client.garden
        garden = new model({
            userId: message.author.id,
            guildId: message.guild.id,
        });
        await garden.save();
    };
    const p1 = garden.plantOne;
    const p2 = garden.plantTwo;
    const p3 = garden.plantThree;
    var s1 = garden.plantOneStage;
    var s2 = garden.plantTwoStage;
    var s3 = garden.plantThreeStage;

    var f1 = s1.replace('1', '').replace('2', ':seedling: ').replace('3', ':seedling: ').replace('4', `:${p1}: `)
    var f2 = s2.replace('1', '').replace('2', ':seedling: ').replace('3', ':seedling: ').replace('4', `:${p2}: `)
    var f3 = s3.replace('1', '').replace('2', ':seedling: ').replace('3', ':seedling: ').replace('4', `:${p3}: `)

    const empty = client.customEmojis.get("empty");
    if (f1 === "0") f1 = empty
    if (f2 === "0") f2 = empty
    if (f3 === "0") f3 = empty

    const grass = client.customEmojis.get("dirt");
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setAuthor(`🌼 ${message.author.username}'s garden`, message.author.displayAvatarURL())
        .setDescription(`${f1}${f2}${f3}\n${grass}${grass}${grass}\n\n\nuse \`${prefix}water\` to water your plant or use \`${prefix}plant\` to grow more tree!`)
        .setFooter(`you can only water your plant every 24 hours!`)
    return message.channel.send({ embeds: [embed] })
};
exports.help = {
    name: "garden",
    description: "shows your garden",
    usage: "garden",
    example: "garden"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};