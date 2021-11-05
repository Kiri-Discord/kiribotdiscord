const { MessageEmbed } = require('discord.js');
const itemsList = require('../../assets/items.json');
const itemsName = Object.keys(itemsList);

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
    };
    const array = [];
    const rod = client.customEmojis.get('rod');
    for (const property in storage) {
        if (itemsName.includes(property) && storage[property] > 0) {
            array.push({
                name: itemsList[property].displayName,
                amount: storage[property],
                desc: itemsList[property].desc.replace('{prefix}', prefix).replace('{rod}', rod),
            })
        };
    };
    if (!array.length) return message.channel.send('you have no items in your inventory dear :pensive:');
    const embed = new MessageEmbed()
        .setAuthor(`${message.author.username}'s inventory`)
        // .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor("#bee7f7")
        .setFooter(`your current balance: ⏣ ${money.balance}`)
    const list = array.map(item => {
        return `**${item.name}** - ${item.amount}\n*${item.desc}*`;
    });
    embed.setDescription(list.join('\n\n'));
    return message.channel.send({ embeds: [embed] });
};

exports.help = {
    name: "inventory",
    description: "shows everything you own in your inventory.",
    usage: ["inventory"],
    example: ["inventory"]
};

exports.conf = {
    aliases: ['inv'],
    cooldown: 2,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};