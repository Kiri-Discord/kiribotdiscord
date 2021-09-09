const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    let money = await client.money.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!money) {
        const model = client.money
        money = new model({
            userId: message.author.id,
            guildId: message.guild.id,
        });
        await money.save();
    };
    let storage = await client.inventory.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.inventory
        storage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
        await storage.save();
    };
    const embed = new MessageEmbed()
        .setAuthor(`${message.author.username}'s inventory 🎒`, message.author.displayAvatarURL())
        .setColor("#bee7f7")
        .addField(`💍 wedding rings`, `\`${storage.rings}\``, true)
        .addField(`🌰 seeds`, `\`${storage.seeds}\``, true)
        .addField(`🪱 worms`, `\`${storage.worms}\``, true)
        .setFooter(`your current balance: ⏣ ${money.balance}`)
    return message.channel.send({ embeds: [embed] })
};

exports.help = {
    name: "inventory",
    description: "shows everything you own in your inventory.",
    usage: "inventory",
    example: "inventory"
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};