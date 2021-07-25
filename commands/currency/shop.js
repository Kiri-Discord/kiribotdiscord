const { MessageEmbed } = require('discord.js');
const { embedURL } = require('../../util/util');
const { stripIndents } = require('common-tags');

exports.run = async(client, message, args, prefix) => {
    const rod = client.customEmojis.get('rod');
    const embed = new MessageEmbed()
        .setTitle('the shop 🛒')
        .setColor("#bee7f7")
        .setDescription(`to buy something from the store, type \`${prefix}buy <amount> <items>\`!\ntoken (⏣) can be claimed by winning games, betting and economy related features.\ncheck \`${prefix}help ecomomy\` to get more info :slight_smile:`)
        .addField('items list :moneybag:', stripIndents `
        ${embedURL('💍 wedding ring', 'https://youtu.be/do_XXxrWBxQ')} (⏣ 1,300)
        used to propose to your partner via \`${prefix}marry\` <3
        
        ${embedURL('🌱 seeds', 'https://youtu.be/do_XXxrWBxQ')} (⏣ 50)
        used for planting trees in your garden via \`${prefix}garden\` :chestnut:

        ${embedURL('🪱 worms', 'https://youtu.be/do_XXxrWBxQ')} (⏣ 150)
        bait to use for catching \`${prefix}fish\` ${rod}
        `)

    return message.channel.send(embed);
}


exports.help = {
    name: "shop",
    description: "shows a list of purchasable items.",
    usage: "shop",
    example: "shop"
};

exports.conf = {
    aliases: ["store"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};