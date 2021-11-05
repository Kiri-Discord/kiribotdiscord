const { MessageEmbed } = require('discord.js');
const { embedURL } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const items = require('../../assets/items.json');

exports.run = async(client, interaction) => {
    const rod = client.customEmojis.get('rod');
    const names = Object.keys(items);
    const list = [];

    names.forEach(x => {
        list.push(`
        ${embedURL(items[x].displayName, 'https://youtu.be/do_XXxrWBxQ')} - ${items[x].displayPrice} (ID: \`${x}\`)
        ${items[x].desc.replace('{prefix}', '/').replace('{rod}', rod)}`)
    })
    const embed = new MessageEmbed()
        .setTitle('the shop 🛒')
        .setColor("#bee7f7")
        .setDescription(`to buy something from the store, type \`/buy <amount> <id>\`!\ntoken (⏣) can be claimed by winning games, betting and economy related features. :slight_smile:`)
        .addField('items list :moneybag:', stripIndents `
        ${list.join('\n')}
        `)
    return interaction.reply({ embeds: [embed] });
};


exports.help = {
    name: "shop",
    description: "shows a list of purchasable items.",
    usage: ["shop"],
    example: ["shop"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};