const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    let storage = await client.money.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.money
        const newUser = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
        await newUser.save();
        storage = newUser;
    };
    const p1 = storage.garden.plant1;
    const p2 = storage.garden.plant2;
    const p3 = storage.garden.plant3;
    var s1 = storage.garden.plant1Stage;
    var s2 = storage.garden.plant2Stage;
    var s3 = storage.garden.plant3Stage;

    var f1 = s1.replace('1', '').replace('2', ':seedling: ').replace('3', ':seedling: ').replace('4', `:${p1}: `)
    var f2 = s2.replace('1', '').replace('2', ':seedling: ').replace('3', ':seedling: ').replace('4', `:${p2}: `)
    var f3 = s3.replace('1', '').replace('2', ':seedling: ').replace('3', ':seedling: ').replace('4', `:${p3}: `)

    const empty = client.customEmojis.get("empty");
    if (f1 === "0") f1 = empty
    if (f2 === "0") f2 = empty
    if (f3 === "0") f3 = empty

    const grass = client.customEmojis.get("dirt");
    const embed = new MessageEmbed()
        .setTitle(`${message.author.username}'s garden`)
        .setTimestamp()
        .setDescription(`${f1}${f2}${f3}\n${grass}${grass}${grass}`)
        .setFooter(`${prefix}water to water your plant!`)
    return message.channel.send(embed)
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