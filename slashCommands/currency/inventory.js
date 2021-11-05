const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const itemsList = require('../../assets/items.json');
const itemsName = Object.keys(itemsList);

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    let money = await client.money.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!money) {
        const model = client.money
        money = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });
    };
    let storage = await client.inventory.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.inventory
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    const array = [];
    const rod = client.customEmojis.get('rod');
    for (const property in storage) {
        if (itemsName.includes(property) && storage[property] > 0) {
            array.push({
                name: itemsList[property].displayName,
                amount: storage[property],
                desc: itemsList[property].desc.replace('{prefix}', '/').replace('{rod}', rod),
            })
        };
    };
    if (!array.length) return interaction.editReply('you have no items in your inventory dear :pensive:');
    const embed = new MessageEmbed()
        .setAuthor(`${interaction.user.username}'s inventory`)
        // .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor("#bee7f7")
        .setFooter(`your current balance: ⏣ ${money.balance}`)
    const list = array.map(item => {
        return `**${item.name}** - ${item.amount}\n*${item.desc}*`;
    });
    embed.setDescription(list.join('\n\n'));
    return interaction.editReply({ embeds: [embed] })
};

exports.help = {
    name: "inventory",
    description: "shows everything you own in your inventory.",
    usage: ["inventory"],
    example: ["inventory"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 2,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};